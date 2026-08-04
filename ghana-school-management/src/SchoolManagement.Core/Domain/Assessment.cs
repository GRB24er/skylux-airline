namespace SchoolManagement.Core.Domain;

/// <summary>A question in the reusable question bank.</summary>
public class Question
{
    public int Id { get; set; }
    public int SubjectId { get; set; }
    public Subject? Subject { get; set; }
    public ClassLevel Level { get; set; }
    public string Topic { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public DifficultyLevel Difficulty { get; set; }

    public string Text { get; set; } = string.Empty;

    /// <summary>MCQ options serialized as JSON array, e.g. ["Accra","Kumasi","Tamale","Cape Coast"].</summary>
    public string? OptionsJson { get; set; }

    /// <summary>Zero-based index of the correct MCQ option.</summary>
    public int? CorrectOptionIndex { get; set; }

    public int Marks { get; set; } = 1;

    /// <summary>Model answer / marking guideline for structured and essay questions.</summary>
    public string? ModelAnswer { get; set; }

    /// <summary>Rubric guidance for subjective marking.</summary>
    public string? Rubric { get; set; }

    public int? CreatedByStaffId { get; set; }
    public int TimesUsed { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public bool IsArchived { get; set; }
}

/// <summary>An examination paper for a subject/class/term.</summary>
public class Exam
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int SubjectId { get; set; }
    public Subject? Subject { get; set; }
    public int ClassId { get; set; }
    public SchoolClass? Class { get; set; }
    public int TermId { get; set; }
    public Term? Term { get; set; }
    public ExamType Type { get; set; }
    public ExamStatus Status { get; set; } = ExamStatus.Draft;
    public DateOnly? ExamDate { get; set; }
    public int DurationMinutes { get; set; }
    public int TotalMarks { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public List<ExamQuestion> Questions { get; set; } = new();
}

/// <summary>A question placed on a specific exam paper.</summary>
public class ExamQuestion
{
    public int Id { get; set; }
    public int ExamId { get; set; }
    public Exam? Exam { get; set; }
    public int QuestionId { get; set; }
    public Question? Question { get; set; }
    public int OrderIndex { get; set; }
    public int Marks { get; set; }
}

/// <summary>A student's answer to one exam question.</summary>
public class StudentAnswer
{
    public int Id { get; set; }
    public int ExamQuestionId { get; set; }
    public ExamQuestion? ExamQuestion { get; set; }
    public int StudentId { get; set; }
    public Student? Student { get; set; }

    /// <summary>Selected option index for MCQ answers.</summary>
    public int? SelectedOptionIndex { get; set; }

    /// <summary>Free text for structured/essay answers.</summary>
    public string? AnswerText { get; set; }

    public decimal? AwardedMarks { get; set; }
    public bool IsAutoMarked { get; set; }
    public int? MarkedByStaffId { get; set; }
    public string? MarkerFeedback { get; set; }
}

/// <summary>A student's overall result for one exam (objective + subjective).</summary>
public class StudentExamResult
{
    public int Id { get; set; }
    public int ExamId { get; set; }
    public Exam? Exam { get; set; }
    public int StudentId { get; set; }
    public Student? Student { get; set; }

    public decimal ObjectiveScore { get; set; }
    public decimal SubjectiveScore { get; set; }
    public decimal TotalScore { get; set; }
    public decimal Percentage { get; set; }

    /// <summary>BECE 9-point grade (JHS only).</summary>
    public int? BeceGrade { get; set; }

    /// <summary>Letter grade (Primary/KG).</summary>
    public string? LetterGrade { get; set; }

    public DateTime? CompletedAtUtc { get; set; }
}

/// <summary>
/// A student's consolidated grade for one subject in one term:
/// Continuous Assessment (40%) + End-of-Term exam (60%).
/// </summary>
public class TermGrade
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int SubjectId { get; set; }
    public Subject? Subject { get; set; }
    public int TermId { get; set; }
    public Term? Term { get; set; }

    /// <summary>Continuous assessment score out of 100 (classwork, assignments, quizzes, mid-term).</summary>
    public decimal CaScore { get; set; }

    /// <summary>End-of-term exam score out of 100.</summary>
    public decimal ExamScore { get; set; }

    /// <summary>Weighted final score out of 100.</summary>
    public decimal FinalScore { get; set; }

    public string GradeLabel { get; set; } = string.Empty;
    public string? Remark { get; set; }
    public int? SubjectPosition { get; set; }
}

/// <summary>A generated end-of-term report card for one student.</summary>
public class ReportCard
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int TermId { get; set; }
    public Term? Term { get; set; }

    public decimal OverallAverage { get; set; }
    public int ClassPosition { get; set; }
    public int ClassSize { get; set; }
    public int DaysPresent { get; set; }
    public int DaysInTerm { get; set; }
    public string? ClassTeacherComment { get; set; }
    public string? HeadteacherComment { get; set; }
    public PromotionStatus Promotion { get; set; } = PromotionStatus.Pending;
    public DateTime GeneratedAtUtc { get; set; }
}
