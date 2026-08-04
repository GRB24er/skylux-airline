using System.Text;
using System.Text.Json;
using SchoolManagement.Core.Domain;

namespace SchoolManagement.Core.Exams;

/// <summary>One entry in a generated marking scheme.</summary>
public record MarkingSchemeEntry(
    int OrderIndex,
    QuestionType Type,
    int Marks,
    string QuestionText,
    string? CorrectAnswer,
    string? Rubric);

/// <summary>
/// Auto-generates a marking scheme for an exam: answer keys for MCQs,
/// model answers and rubrics for structured/essay questions.
/// </summary>
public static class MarkingSchemeGenerator
{
    public static List<MarkingSchemeEntry> Generate(Exam exam)
    {
        var entries = new List<MarkingSchemeEntry>();
        foreach (var eq in exam.Questions.OrderBy(q => q.OrderIndex))
        {
            var q = eq.Question ?? throw new InvalidOperationException(
                $"Exam question {eq.OrderIndex} has no loaded Question — load the exam with its questions included.");

            string? correct = null;
            if (q.Type == QuestionType.MultipleChoice)
            {
                var options = DeserializeOptions(q.OptionsJson);
                if (q.CorrectOptionIndex is null || q.CorrectOptionIndex < 0 || q.CorrectOptionIndex >= options.Count)
                    throw new InvalidOperationException($"MCQ question {q.Id} has no valid correct option.");
                correct = $"{(char)('A' + q.CorrectOptionIndex.Value)}. {options[q.CorrectOptionIndex.Value]}";
            }
            else
            {
                correct = q.ModelAnswer;
            }

            entries.Add(new MarkingSchemeEntry(eq.OrderIndex, q.Type, eq.Marks, q.Text, correct, q.Rubric));
        }
        return entries;
    }

    /// <summary>Render the scheme as printable text for teachers.</summary>
    public static string RenderText(Exam exam, IReadOnlyList<MarkingSchemeEntry> entries)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"MARKING SCHEME — {exam.Title}");
        sb.AppendLine($"Total marks: {exam.TotalMarks}");
        sb.AppendLine(new string('=', 60));
        foreach (var e in entries)
        {
            sb.AppendLine($"Q{e.OrderIndex} [{e.Type}, {e.Marks} mark(s)]");
            sb.AppendLine($"  {e.QuestionText}");
            if (!string.IsNullOrWhiteSpace(e.CorrectAnswer))
                sb.AppendLine($"  Answer: {e.CorrectAnswer}");
            if (!string.IsNullOrWhiteSpace(e.Rubric))
                sb.AppendLine($"  Rubric: {e.Rubric}");
            sb.AppendLine();
        }
        return sb.ToString();
    }

    public static List<string> DeserializeOptions(string? optionsJson)
    {
        if (string.IsNullOrWhiteSpace(optionsJson)) return new List<string>();
        return JsonSerializer.Deserialize<List<string>>(optionsJson) ?? new List<string>();
    }
}

/// <summary>
/// Automatically marks the objective (MCQ) portion of a student's answers.
/// Subjective questions are left for the teacher.
/// </summary>
public static class AutoMarker
{
    /// <summary>
    /// Marks every MCQ answer in place (sets AwardedMarks and IsAutoMarked) and
    /// returns the objective score earned.
    /// </summary>
    public static decimal MarkObjectives(Exam exam, IEnumerable<StudentAnswer> answers)
    {
        var byExamQuestionId = exam.Questions.ToDictionary(q => q.Id);
        decimal score = 0;

        foreach (var answer in answers)
        {
            if (!byExamQuestionId.TryGetValue(answer.ExamQuestionId, out var eq))
                continue;

            var q = eq.Question ?? throw new InvalidOperationException(
                $"Exam question {eq.Id} has no loaded Question.");

            if (q.Type != QuestionType.MultipleChoice)
                continue;

            var correct = answer.SelectedOptionIndex is not null &&
                          answer.SelectedOptionIndex == q.CorrectOptionIndex;
            answer.AwardedMarks = correct ? eq.Marks : 0;
            answer.IsAutoMarked = true;
            score += answer.AwardedMarks.Value;
        }

        return score;
    }

    /// <summary>Sum of teacher-awarded marks on subjective questions.</summary>
    public static decimal SumSubjectives(Exam exam, IEnumerable<StudentAnswer> answers)
    {
        var subjectiveIds = exam.Questions
            .Where(q => q.Question?.Type != QuestionType.MultipleChoice)
            .Select(q => q.Id)
            .ToHashSet();

        return answers
            .Where(a => subjectiveIds.Contains(a.ExamQuestionId))
            .Sum(a => a.AwardedMarks ?? 0);
    }
}
