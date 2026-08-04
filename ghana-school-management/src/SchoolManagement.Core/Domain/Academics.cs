namespace SchoolManagement.Core.Domain;

/// <summary>A class group, e.g. "Primary 4" or "JHS 2".</summary>
public class SchoolClass
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ClassLevel Level { get; set; }
    public int Capacity { get; set; } = 40;

    public int? ClassTeacherId { get; set; }
    public StaffMember? ClassTeacher { get; set; }

    public List<Student> Students { get; set; } = new();

    public bool IsJhs => Level is ClassLevel.JHS1 or ClassLevel.JHS2 or ClassLevel.JHS3;
}

/// <summary>A GES curriculum subject.</summary>
public class Subject
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public bool IsCore { get; set; }
}

/// <summary>An academic year, e.g. "2025/2026" (September to July).</summary>
public class AcademicYear
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public bool IsCurrent { get; set; }

    public List<Term> Terms { get; set; } = new();
}

/// <summary>One of the three terms in a Ghanaian academic year.</summary>
public class Term
{
    public int Id { get; set; }
    public int AcademicYearId { get; set; }
    public AcademicYear? AcademicYear { get; set; }
    public TermNumber Number { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public bool IsCurrent { get; set; }
}

/// <summary>Which teacher teaches which subject to which class.</summary>
public class TeachingAssignment
{
    public int Id { get; set; }
    public int StaffId { get; set; }
    public StaffMember? Staff { get; set; }
    public int ClassId { get; set; }
    public SchoolClass? Class { get; set; }
    public int SubjectId { get; set; }
    public Subject? Subject { get; set; }
    public int AcademicYearId { get; set; }
    public AcademicYear? AcademicYear { get; set; }
}

/// <summary>A teacher's Scheme of Work for one subject/class/term, submitted for headteacher approval.</summary>
public class SchemeOfWork
{
    public int Id { get; set; }
    public int StaffId { get; set; }
    public StaffMember? Staff { get; set; }
    public int SubjectId { get; set; }
    public Subject? Subject { get; set; }
    public int ClassId { get; set; }
    public SchoolClass? Class { get; set; }
    public int TermId { get; set; }
    public Term? Term { get; set; }

    public SowStatus Status { get; set; } = SowStatus.Draft;
    public DateTime? SubmittedAtUtc { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }
    public int? ReviewedByStaffId { get; set; }
    public string? ReviewComment { get; set; }

    public List<SowWeek> Weeks { get; set; } = new();
}

/// <summary>One week's plan within a Scheme of Work.</summary>
public class SowWeek
{
    public int Id { get; set; }
    public int SchemeOfWorkId { get; set; }
    public SchemeOfWork? SchemeOfWork { get; set; }
    public int WeekNumber { get; set; }
    public string Topic { get; set; } = string.Empty;
    public string? LearningObjectives { get; set; }
    public string? TeachingMethods { get; set; }
    public string? Resources { get; set; }
    public string? AssessmentStrategy { get; set; }
    public bool IsCompleted { get; set; }
}

/// <summary>A school announcement visible on the portals.</summary>
public class Announcement
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime PostedAtUtc { get; set; }
    public UserRole? AudienceRole { get; set; }
}
