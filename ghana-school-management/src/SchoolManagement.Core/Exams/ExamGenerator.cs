using SchoolManagement.Core.Domain;

namespace SchoolManagement.Core.Exams;

/// <summary>What kind of paper to generate.</summary>
public record ExamBlueprint(
    int McqCount,
    int StructuredCount,
    int EssayCount,
    decimal EasyRatio = 0.20m,
    decimal MediumRatio = 0.60m,
    decimal HardRatio = 0.20m)
{
    /// <summary>BECE-style paper for JHS: 40 MCQs, 10 structured, 3 essays.</summary>
    public static ExamBlueprint Bece { get; } = new(40, 10, 3);

    /// <summary>A lighter paper for KG/Primary: 20 MCQs, 5 structured, 1 essay.</summary>
    public static ExamBlueprint Primary { get; } = new(20, 5, 1);

    public static ExamBlueprint ForLevel(ClassLevel level) =>
        level is ClassLevel.JHS1 or ClassLevel.JHS2 or ClassLevel.JHS3 ? Bece : Primary;
}

/// <summary>Raised when the question bank cannot satisfy a blueprint.</summary>
public class InsufficientQuestionsException : Exception
{
    public InsufficientQuestionsException(QuestionType type, int requested, int available)
        : base($"Question bank has only {available} {type} question(s); {requested} requested.")
    {
        Type = type;
        Requested = requested;
        Available = available;
    }

    public QuestionType Type { get; }
    public int Requested { get; }
    public int Available { get; }
}

/// <summary>
/// Selects questions from the bank to build an exam paper: enforces the
/// easy/medium/hard distribution (default 20/60/20), never repeats a question
/// on a paper, and prefers less-recently-used questions.
/// </summary>
public class ExamGenerator
{
    private readonly Random _random;

    public ExamGenerator(int? seed = null)
    {
        _random = seed is null ? Random.Shared : new Random(seed.Value);
    }

    /// <summary>
    /// Pick questions for each section of the blueprint from <paramref name="pool"/>.
    /// The pool should already be filtered to the exam's subject and class level.
    /// </summary>
    public List<Question> SelectQuestions(IReadOnlyList<Question> pool, ExamBlueprint blueprint)
    {
        var usable = pool.Where(q => !q.IsArchived).ToList();
        var selected = new List<Question>();
        SelectSection(usable, selected, QuestionType.MultipleChoice, blueprint.McqCount, blueprint);
        SelectSection(usable, selected, QuestionType.Structured, blueprint.StructuredCount, blueprint);
        SelectSection(usable, selected, QuestionType.Essay, blueprint.EssayCount, blueprint);
        return selected;
    }

    private void SelectSection(
        List<Question> pool, List<Question> selected, QuestionType type, int count, ExamBlueprint blueprint)
    {
        if (count == 0) return;

        var candidates = pool.Where(q => q.Type == type && !selected.Contains(q)).ToList();
        if (candidates.Count < count)
            throw new InsufficientQuestionsException(type, count, candidates.Count);

        var easyTarget = (int)Math.Round(count * blueprint.EasyRatio, MidpointRounding.AwayFromZero);
        var hardTarget = (int)Math.Round(count * blueprint.HardRatio, MidpointRounding.AwayFromZero);
        var mediumTarget = count - easyTarget - hardTarget;

        var picked = new List<Question>();
        picked.AddRange(Draw(candidates, DifficultyLevel.Easy, easyTarget));
        picked.AddRange(Draw(candidates.Except(picked).ToList(), DifficultyLevel.Medium, mediumTarget));
        picked.AddRange(Draw(candidates.Except(picked).ToList(), DifficultyLevel.Hard, hardTarget));

        // Backfill from any difficulty when one band ran short.
        if (picked.Count < count)
        {
            var remaining = candidates.Except(picked).OrderBy(q => q.TimesUsed).ThenBy(_ => _random.Next()).ToList();
            picked.AddRange(remaining.Take(count - picked.Count));
        }

        selected.AddRange(picked);
    }

    private IEnumerable<Question> Draw(List<Question> candidates, DifficultyLevel difficulty, int count)
    {
        return candidates
            .Where(q => q.Difficulty == difficulty)
            .OrderBy(q => q.TimesUsed)
            .ThenBy(_ => _random.Next())
            .Take(count);
    }

    /// <summary>
    /// Build an <see cref="Exam"/> with ordered <see cref="ExamQuestion"/>s (MCQs first,
    /// then structured, then essays) from an already-selected question list.
    /// </summary>
    public Exam BuildExam(
        string title, int subjectId, int classId, int termId, ExamType type,
        IReadOnlyList<Question> questions, int durationMinutes)
    {
        var exam = new Exam
        {
            Title = title,
            SubjectId = subjectId,
            ClassId = classId,
            TermId = termId,
            Type = type,
            DurationMinutes = durationMinutes,
            Status = ExamStatus.Draft,
            CreatedAtUtc = DateTime.UtcNow
        };

        var ordered = questions
            .OrderBy(q => q.Type)
            .ThenBy(q => q.Difficulty)
            .ToList();

        for (var i = 0; i < ordered.Count; i++)
        {
            exam.Questions.Add(new ExamQuestion
            {
                QuestionId = ordered[i].Id,
                Question = ordered[i],
                OrderIndex = i + 1,
                Marks = ordered[i].Marks
            });
        }

        exam.TotalMarks = exam.Questions.Sum(q => q.Marks);
        return exam;
    }
}
