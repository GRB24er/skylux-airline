namespace SchoolManagement.Core.Domain;

/// <summary>A pupil enrolled in the school (KG through JHS 3).</summary>
public class Student
{
    public int Id { get; set; }

    /// <summary>GES-style index number, e.g. "GES-2025-0001".</summary>
    public string IndexNumber { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? OtherNames { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string? PhotoPath { get; set; }

    public string GuardianName { get; set; } = string.Empty;
    public string GuardianPhone { get; set; } = string.Empty;
    public string? GuardianEmail { get; set; }
    public string? EmergencyContact { get; set; }

    public StudentStatus Status { get; set; } = StudentStatus.Active;
    public DateOnly EnrollmentDate { get; set; }
    public DateOnly? CompletionDate { get; set; }

    public int? CurrentClassId { get; set; }
    public SchoolClass? CurrentClass { get; set; }

    public string FullName => string.IsNullOrWhiteSpace(OtherNames)
        ? $"{FirstName} {LastName}"
        : $"{FirstName} {OtherNames} {LastName}";
}

/// <summary>A member of staff — teaching or non-teaching.</summary>
public class StaffMember
{
    public int Id { get; set; }
    public string StaffNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public StaffRole Role { get; set; }
    public string? Qualification { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public DateOnly HireDate { get; set; }
    public decimal MonthlySalaryGhs { get; set; }
    public bool IsActive { get; set; } = true;

    public string FullName => $"{FirstName} {LastName}";
}

/// <summary>A login account. May be linked to a student (student/parent portal) or a staff member.</summary>
public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? LastLoginUtc { get; set; }

    /// <summary>For Student logins — and for Parent logins, the child whose records they may view.</summary>
    public int? LinkedStudentId { get; set; }
    public Student? LinkedStudent { get; set; }

    public int? LinkedStaffId { get; set; }
    public StaffMember? LinkedStaff { get; set; }
}
