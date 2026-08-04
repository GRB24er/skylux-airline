using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;
using SchoolManagement.Core.Exams;
using SchoolManagement.Core.Grading;
using SchoolManagement.Data;

namespace SchoolManagement.Services;

/// <summary>
/// The automated exam pipeline: generate a paper from the question bank,
/// auto-mark objectives, collect teacher marks for subjectives, and finalize
/// graded results on the appropriate scale.
/// </summary>
public class ExamService
{
    private readonly SchoolDbContext _db;
    private readonly ExamGenerator _generator;

    public ExamService(SchoolDbContext db, ExamGenerator? generator = null)
    {
        _db = db;
        _generator = generator ?? new ExamGenerator();
    }

    /// <summary>
    /// Auto-generate a draft exam for a subject/class/term from the question bank.
    /// Uses the BECE blueprint for JHS classes and a lighter one for Primary/KG,
    /// unless a custom blueprint is supplied.
    /// </summary>
    public async Task<Exam> GenerateExamAsync(
        int subjectId, int classId, int termId, ExamType type,
        ExamBlueprint? blueprint = null, int durationMinutes = 120)
    {
        var schoolClass = await _db.Classes.FindAsync(classId)
            ?? throw new InvalidOperationException($"Class {classId} not found.");
        var subject = await _db.Subjects.FindAsync(subjectId)
            ?? throw new InvalidOperationException($"Subject {subjectId} not found.");
        var term = await _db.Terms.Include(t => t.AcademicYear).FirstOrDefaultAsync(t => t.Id == termId)
            ?? throw new InvalidOperationException($"Term {termId} not found.");

        blueprint ??= ExamBlueprint.ForLevel(schoolClass.Level);

        var pool = await _db.Questions
            .Where(q => q.SubjectId == subjectId && q.Level == schoolClass.Level && !q.IsArchived)
            .ToListAsync();

        var selected = _generator.SelectQuestions(pool, blueprint);

        var title = $"{subject.Name} — {schoolClass.Name} — {type} ({term.AcademicYear?.Name} Term {(int)term.Number})";
        var exam = _generator.BuildExam(title, subjectId, classId, termId, type, selected, durationMinutes);

        foreach (var q in selected)
            q.TimesUsed++;

        _db.Exams.Add(exam);
        await _db.SaveChangesAsync();
        return exam;
    }

    public async Task ApproveExamAsync(int examId)
    {
        var exam = await _db.Exams.FindAsync(examId)
            ?? throw new InvalidOperationException($"Exam {examId} not found.");
        exam.Status = ExamStatus.Approved;
        await _db.SaveChangesAsync();
    }

    /// <summary>Save a student's submitted answers for an exam.</summary>
    public async Task SubmitAnswersAsync(int examId, int studentId, IEnumerable<StudentAnswer> answers)
    {
        var examQuestionIds = (await _db.ExamQuestions
            .Where(q => q.ExamId == examId)
            .Select(q => q.Id)
            .ToListAsync()).ToHashSet();

        foreach (var a in answers)
        {
            if (!examQuestionIds.Contains(a.ExamQuestionId))
                throw new InvalidOperationException($"Exam question {a.ExamQuestionId} does not belong to exam {examId}.");
            a.StudentId = studentId;
            _db.StudentAnswers.Add(a);
        }
        await _db.SaveChangesAsync();
    }

    /// <summary>Auto-mark all MCQ answers a student gave on an exam; returns the objective score.</summary>
    public async Task<decimal> AutoMarkObjectivesAsync(int examId, int studentId)
    {
        var exam = await LoadExamWithQuestionsAsync(examId);
        var answers = await _db.StudentAnswers
            .Where(a => a.StudentId == studentId && a.ExamQuestion!.ExamId == examId)
            .ToListAsync();

        var score = AutoMarker.MarkObjectives(exam, answers);
        await _db.SaveChangesAsync();
        return score;
    }

    /// <summary>A teacher awards marks for one subjective answer.</summary>
    public async Task MarkSubjectiveAnswerAsync(int studentAnswerId, decimal awardedMarks, int markedByStaffId, string? feedback = null)
    {
        var answer = await _db.StudentAnswers
            .Include(a => a.ExamQuestion!).ThenInclude(q => q.Question)
            .FirstOrDefaultAsync(a => a.Id == studentAnswerId)
            ?? throw new InvalidOperationException($"Answer {studentAnswerId} not found.");

        if (answer.ExamQuestion!.Question!.Type == QuestionType.MultipleChoice)
            throw new InvalidOperationException("MCQ answers are auto-marked; teachers mark subjective questions only.");

        if (awardedMarks < 0 || awardedMarks > answer.ExamQuestion.Marks)
            throw new ArgumentOutOfRangeException(nameof(awardedMarks),
                $"Marks must be between 0 and {answer.ExamQuestion.Marks}.");

        answer.AwardedMarks = awardedMarks;
        answer.MarkedByStaffId = markedByStaffId;
        answer.MarkerFeedback = feedback;
        await _db.SaveChangesAsync();
    }

    /// <summary>
    /// Combine objective + subjective scores into a final result with the grade
    /// on the scale appropriate to the class (BECE 9-point for JHS, letters otherwise).
    /// </summary>
    public async Task<StudentExamResult> FinalizeResultAsync(int examId, int studentId)
    {
        var exam = await LoadExamWithQuestionsAsync(examId);
        var schoolClass = await _db.Classes.FindAsync(exam.ClassId)
            ?? throw new InvalidOperationException($"Class {exam.ClassId} not found.");

        var answers = await _db.StudentAnswers
            .Where(a => a.StudentId == studentId && a.ExamQuestion!.ExamId == examId)
            .ToListAsync();

        var objective = answers
            .Where(a => a.IsAutoMarked)
            .Sum(a => a.AwardedMarks ?? 0);
        var subjective = AutoMarker.SumSubjectives(exam, answers);
        var total = objective + subjective;
        var percentage = exam.TotalMarks == 0 ? 0 : Math.Round(total * 100m / exam.TotalMarks, 2);

        var grade = GradeCalculator.Grade(percentage, schoolClass.Level);

        var result = await _db.StudentExamResults
            .FirstOrDefaultAsync(r => r.ExamId == examId && r.StudentId == studentId);
        if (result is null)
        {
            result = new StudentExamResult { ExamId = examId, StudentId = studentId };
            _db.StudentExamResults.Add(result);
        }

        result.ObjectiveScore = objective;
        result.SubjectiveScore = subjective;
        result.TotalScore = total;
        result.Percentage = percentage;
        result.BeceGrade = grade.BeceGrade;
        result.LetterGrade = grade.BeceGrade is null ? grade.Label : null;
        result.CompletedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return result;
    }

    /// <summary>Generate the marking scheme for an exam, rendered as printable text.</summary>
    public async Task<string> GetMarkingSchemeTextAsync(int examId)
    {
        var exam = await LoadExamWithQuestionsAsync(examId);
        var entries = MarkingSchemeGenerator.Generate(exam);
        return MarkingSchemeGenerator.RenderText(exam, entries);
    }

    private async Task<Exam> LoadExamWithQuestionsAsync(int examId) =>
        await _db.Exams
            .Include(e => e.Questions).ThenInclude(q => q.Question)
            .FirstOrDefaultAsync(e => e.Id == examId)
        ?? throw new InvalidOperationException($"Exam {examId} not found.");
}
