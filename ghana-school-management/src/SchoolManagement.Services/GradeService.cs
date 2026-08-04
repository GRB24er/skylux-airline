using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;
using SchoolManagement.Core.Grading;
using SchoolManagement.Data;

namespace SchoolManagement.Services;

/// <summary>
/// Consolidates CA and exam scores into term grades
/// (final = CA x 40% + exam x 60% by default) and computes class positions.
/// </summary>
public class GradeService
{
    private readonly SchoolDbContext _db;

    public GradeService(SchoolDbContext db) => _db = db;

    /// <summary>Record (or update) a student's CA and exam scores for a subject/term and compute the final grade.</summary>
    public async Task<TermGrade> RecordTermGradeAsync(int studentId, int subjectId, int termId, decimal caScore, decimal examScore)
    {
        var student = await _db.Students.Include(s => s.CurrentClass).FirstOrDefaultAsync(s => s.Id == studentId)
            ?? throw new InvalidOperationException($"Student {studentId} not found.");
        var level = student.CurrentClass?.Level
            ?? throw new InvalidOperationException($"Student {studentId} is not assigned to a class.");

        var settings = await _db.Settings.FirstOrDefaultAsync();
        var caWeight = settings?.CaWeight ?? GradeCalculator.DefaultCaWeight;
        var examWeight = settings?.ExamWeight ?? GradeCalculator.DefaultExamWeight;

        var final = GradeCalculator.ComputeFinalScore(caScore, examScore, caWeight, examWeight);
        var grade = GradeCalculator.Grade(final, level);

        var row = await _db.TermGrades.FirstOrDefaultAsync(g =>
            g.StudentId == studentId && g.SubjectId == subjectId && g.TermId == termId);
        if (row is null)
        {
            row = new TermGrade { StudentId = studentId, SubjectId = subjectId, TermId = termId };
            _db.TermGrades.Add(row);
        }

        row.CaScore = caScore;
        row.ExamScore = examScore;
        row.FinalScore = final;
        row.GradeLabel = grade.Label;
        row.Remark = grade.Remark;

        await _db.SaveChangesAsync();
        return row;
    }

    /// <summary>
    /// Recompute per-subject positions and return each student's overall average
    /// for a class/term, ordered best first.
    /// </summary>
    public async Task<List<(int StudentId, decimal Average, int Position)>> ComputeClassStandingsAsync(int classId, int termId)
    {
        var studentIds = await _db.Students
            .Where(s => s.CurrentClassId == classId && s.Status == StudentStatus.Active)
            .Select(s => s.Id)
            .ToListAsync();

        var grades = await _db.TermGrades
            .Where(g => g.TermId == termId && studentIds.Contains(g.StudentId))
            .ToListAsync();

        // Per-subject positions.
        foreach (var subjectGroup in grades.GroupBy(g => g.SubjectId))
        {
            var positions = GradeCalculator.RankPositions(
                subjectGroup.ToDictionary(g => g.StudentId, g => g.FinalScore));
            foreach (var g in subjectGroup)
                g.SubjectPosition = positions[g.StudentId];
        }

        // Overall averages and class positions.
        var averages = grades
            .GroupBy(g => g.StudentId)
            .ToDictionary(g => g.Key, g => Math.Round(g.Average(x => x.FinalScore), 2));

        var overallPositions = GradeCalculator.RankPositions(averages);
        await _db.SaveChangesAsync();

        return averages
            .Select(kv => (kv.Key, kv.Value, overallPositions[kv.Key]))
            .OrderBy(x => x.Item3)
            .ToList();
    }
}
