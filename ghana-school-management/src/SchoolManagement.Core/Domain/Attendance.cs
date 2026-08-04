namespace SchoolManagement.Core.Domain;

/// <summary>Daily attendance for a student.</summary>
public class StudentAttendance
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int ClassId { get; set; }
    public SchoolClass? Class { get; set; }
    public DateOnly Date { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Note { get; set; }
    public int? RecordedByStaffId { get; set; }
}

/// <summary>Daily attendance for a staff member.</summary>
public class StaffAttendance
{
    public int Id { get; set; }
    public int StaffId { get; set; }
    public StaffMember? Staff { get; set; }
    public DateOnly Date { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Note { get; set; }
}

/// <summary>A staff leave request with approval workflow.</summary>
public class LeaveRequest
{
    public int Id { get; set; }
    public int StaffId { get; set; }
    public StaffMember? Staff { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool? Approved { get; set; }
    public int? ReviewedByStaffId { get; set; }
    public DateTime RequestedAtUtc { get; set; }
}
