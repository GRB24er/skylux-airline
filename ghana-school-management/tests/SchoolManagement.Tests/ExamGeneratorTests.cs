using System.Text.Json;
using SchoolManagement.Core.Domain;
using SchoolManagement.Core.Exams;
using Xunit;

namespace SchoolManagement.Tests;

public class ExamGeneratorTests
{
    private static List<Question> MakeBank(int perTypePerDifficulty = 30)
    {
        var bank = new List<Question>();
        var id = 1;
        foreach (var type in new[] { QuestionType.MultipleChoice, QuestionType.Structured, QuestionType.Essay })
        foreach (var difficulty in new[] { DifficultyLevel.Easy, DifficultyLevel.Medium, DifficultyLevel.Hard })
        for (var i = 0; i < perTypePerDifficulty; i++)
        {
            bank.Add(new Question
            {
                Id = id++,
                SubjectId = 1,
                Level = ClassLevel.JHS2,
                Type = type,
                Difficulty = difficulty,
                Text = $"Q{id}",
                Marks = type == QuestionType.MultipleChoice ? 1 : type == QuestionType.Structured ? 5 : 10,
                OptionsJson = type == QuestionType.MultipleChoice
                    ? JsonSerializer.Serialize(new[] { "A", "B", "C", "D" })
                    : null,
                CorrectOptionIndex = type == QuestionType.MultipleChoice ? 2 : null
            });
        }
        return bank;
    }

    [Fact]
    public void Bece_blueprint_selects_40_mcq_10_structured_3_essay()
    {
        var selected = new ExamGenerator(seed: 42).SelectQuestions(MakeBank(), ExamBlueprint.Bece);

        Assert.Equal(40, selected.Count(q => q.Type == QuestionType.MultipleChoice));
        Assert.Equal(10, selected.Count(q => q.Type == QuestionType.Structured));
        Assert.Equal(3, selected.Count(q => q.Type == QuestionType.Essay));
    }

    [Fact]
    public void Difficulty_distribution_is_20_60_20()
    {
        var selected = new ExamGenerator(seed: 42).SelectQuestions(MakeBank(), ExamBlueprint.Bece);
        var mcqs = selected.Where(q => q.Type == QuestionType.MultipleChoice).ToList();

        Assert.Equal(8, mcqs.Count(q => q.Difficulty == DifficultyLevel.Easy));
        Assert.Equal(24, mcqs.Count(q => q.Difficulty == DifficultyLevel.Medium));
        Assert.Equal(8, mcqs.Count(q => q.Difficulty == DifficultyLevel.Hard));
    }

    [Fact]
    public void No_question_appears_twice_on_a_paper()
    {
        var selected = new ExamGenerator(seed: 7).SelectQuestions(MakeBank(), ExamBlueprint.Bece);
        Assert.Equal(selected.Count, selected.Select(q => q.Id).Distinct().Count());
    }

    [Fact]
    public void Backfills_from_other_difficulties_when_a_band_is_short()
    {
        // Only medium questions available — easy/hard targets must backfill.
        var bank = MakeBank(0);
        for (var i = 0; i < 50; i++)
        {
            bank.Add(new Question
            {
                Id = 1000 + i,
                Type = QuestionType.MultipleChoice,
                Difficulty = DifficultyLevel.Medium,
                Text = $"M{i}",
                Marks = 1
            });
        }

        var selected = new ExamGenerator(seed: 1).SelectQuestions(bank, new ExamBlueprint(40, 0, 0));
        Assert.Equal(40, selected.Count);
    }

    [Fact]
    public void Throws_when_bank_cannot_fill_a_section()
    {
        var ex = Assert.Throws<InsufficientQuestionsException>(() =>
            new ExamGenerator(seed: 1).SelectQuestions(MakeBank(1), ExamBlueprint.Bece));
        Assert.Equal(QuestionType.MultipleChoice, ex.Type);
        Assert.Equal(40, ex.Requested);
        Assert.Equal(3, ex.Available);
    }

    [Fact]
    public void Archived_questions_are_never_selected()
    {
        var bank = MakeBank();
        foreach (var q in bank.Where(q => q.Type == QuestionType.Essay))
            q.IsArchived = true;

        Assert.Throws<InsufficientQuestionsException>(() =>
            new ExamGenerator(seed: 1).SelectQuestions(bank, ExamBlueprint.Bece));
    }

    [Fact]
    public void BuildExam_orders_mcqs_first_and_sums_total_marks()
    {
        var generator = new ExamGenerator(seed: 42);
        var selected = generator.SelectQuestions(MakeBank(), ExamBlueprint.Bece);
        var exam = generator.BuildExam("Test", 1, 1, 1, ExamType.EndOfTerm, selected, 150);

        // 40 x 1 + 10 x 5 + 3 x 10 = 120
        Assert.Equal(120, exam.TotalMarks);
        Assert.Equal(QuestionType.MultipleChoice, exam.Questions.OrderBy(q => q.OrderIndex).First().Question!.Type);
        Assert.Equal(QuestionType.Essay, exam.Questions.OrderBy(q => q.OrderIndex).Last().Question!.Type);
    }

    [Fact]
    public void MarkingScheme_includes_answer_key_for_mcqs()
    {
        var generator = new ExamGenerator(seed: 42);
        var selected = generator.SelectQuestions(MakeBank(), ExamBlueprint.Bece);
        var exam = generator.BuildExam("Test", 1, 1, 1, ExamType.EndOfTerm, selected, 150);

        var scheme = MarkingSchemeGenerator.Generate(exam);
        var mcqEntries = scheme.Where(e => e.Type == QuestionType.MultipleChoice).ToList();

        Assert.Equal(40, mcqEntries.Count);
        Assert.All(mcqEntries, e => Assert.StartsWith("C. ", e.CorrectAnswer));
    }
}

public class AutoMarkerTests
{
    private static (Exam exam, List<StudentAnswer> answers) MakeExamWithAnswers()
    {
        var exam = new Exam { Id = 1, TotalMarks = 12 };
        // 2 MCQs (correct index 1), 1 essay worth 10.
        exam.Questions.Add(new ExamQuestion
        {
            Id = 1, ExamId = 1, OrderIndex = 1, Marks = 1,
            Question = new Question { Id = 1, Type = QuestionType.MultipleChoice, CorrectOptionIndex = 1 }
        });
        exam.Questions.Add(new ExamQuestion
        {
            Id = 2, ExamId = 1, OrderIndex = 2, Marks = 1,
            Question = new Question { Id = 2, Type = QuestionType.MultipleChoice, CorrectOptionIndex = 1 }
        });
        exam.Questions.Add(new ExamQuestion
        {
            Id = 3, ExamId = 1, OrderIndex = 3, Marks = 10,
            Question = new Question { Id = 3, Type = QuestionType.Essay }
        });

        var answers = new List<StudentAnswer>
        {
            new() { ExamQuestionId = 1, StudentId = 1, SelectedOptionIndex = 1 }, // correct
            new() { ExamQuestionId = 2, StudentId = 1, SelectedOptionIndex = 3 }, // wrong
            new() { ExamQuestionId = 3, StudentId = 1, AnswerText = "essay text" }
        };
        return (exam, answers);
    }

    [Fact]
    public void Marks_only_mcqs_and_returns_objective_score()
    {
        var (exam, answers) = MakeExamWithAnswers();
        var score = AutoMarker.MarkObjectives(exam, answers);

        Assert.Equal(1m, score);
        Assert.True(answers[0].IsAutoMarked);
        Assert.Equal(1m, answers[0].AwardedMarks);
        Assert.Equal(0m, answers[1].AwardedMarks);
        Assert.False(answers[2].IsAutoMarked);
        Assert.Null(answers[2].AwardedMarks);
    }

    [Fact]
    public void SumSubjectives_counts_teacher_awarded_marks_only()
    {
        var (exam, answers) = MakeExamWithAnswers();
        AutoMarker.MarkObjectives(exam, answers);
        answers[2].AwardedMarks = 7.5m; // teacher marks the essay

        Assert.Equal(7.5m, AutoMarker.SumSubjectives(exam, answers));
    }
}
