namespace SchoolManagement.Core.Domain;

/// <summary>Application roles used for role-based access control.</summary>
public enum UserRole
{
    Owner = 1,
    Headteacher = 2,
    Teacher = 3,
    Accountant = 4,
    Admin = 5,
    Parent = 6,
    Student = 7
}

/// <summary>Ghana basic-school class levels: KG, Primary 1-6 and JHS 1-3.</summary>
public enum ClassLevel
{
    KG1 = 1,
    KG2 = 2,
    Primary1 = 3,
    Primary2 = 4,
    Primary3 = 5,
    Primary4 = 6,
    Primary5 = 7,
    Primary6 = 8,
    JHS1 = 9,
    JHS2 = 10,
    JHS3 = 11
}

public enum TermNumber
{
    First = 1,
    Second = 2,
    Third = 3
}

public enum StudentStatus
{
    Active = 1,
    Graduated = 2,
    Withdrawn = 3
}

public enum StaffRole
{
    Headteacher = 1,
    ClassTeacher = 2,
    SubjectTeacher = 3,
    Admin = 4,
    Accountant = 5
}

public enum AttendanceStatus
{
    Present = 1,
    Absent = 2,
    Late = 3,
    Excused = 4,
    OnLeave = 5
}

public enum QuestionType
{
    MultipleChoice = 1,
    Structured = 2,
    Essay = 3
}

public enum DifficultyLevel
{
    Easy = 1,
    Medium = 2,
    Hard = 3
}

public enum ExamType
{
    MidTerm = 1,
    EndOfTerm = 2,
    MockBece = 3
}

public enum ExamStatus
{
    Draft = 1,
    Approved = 2,
    InProgress = 3,
    Completed = 4
}

public enum SowStatus
{
    Draft = 1,
    Submitted = 2,
    Approved = 3,
    RevisionRequested = 4
}

public enum PaymentMethod
{
    Cash = 1,
    MobileMoney = 2,
    BankTransfer = 3,
    Cheque = 4
}

public enum PromotionStatus
{
    Pending = 0,
    Promoted = 1,
    Retained = 2,
    Graduated = 3
}

public enum LicenseStatus
{
    Pending = 0,
    Active = 1,
    Expired = 2,
    Deactivated = 3
}
