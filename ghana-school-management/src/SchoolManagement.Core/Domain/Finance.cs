namespace SchoolManagement.Core.Domain;

/// <summary>A category of fee charged by the school (tuition, PTA, feeding, transport…).</summary>
public class FeeType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>The amount (GHS) billed for one fee type, per class level, per term.</summary>
public class FeeStructureItem
{
    public int Id { get; set; }
    public int FeeTypeId { get; set; }
    public FeeType? FeeType { get; set; }
    public ClassLevel Level { get; set; }
    public int TermId { get; set; }
    public Term? Term { get; set; }
    public decimal AmountGhs { get; set; }
}

/// <summary>A fee payment received from a student's guardian.</summary>
public class FeePayment
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int TermId { get; set; }
    public Term? Term { get; set; }
    public int? FeeTypeId { get; set; }
    public FeeType? FeeType { get; set; }
    public decimal AmountGhs { get; set; }
    public PaymentMethod Method { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime PaidAtUtc { get; set; }
    public int? ReceivedByStaffId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>A salary payment made to a staff member.</summary>
public class SalaryPayment
{
    public int Id { get; set; }
    public int StaffId { get; set; }
    public StaffMember? Staff { get; set; }
    public decimal AmountGhs { get; set; }
    public DateOnly PeriodMonth { get; set; }
    public DateTime PaidAtUtc { get; set; }
    public string? Notes { get; set; }
}
