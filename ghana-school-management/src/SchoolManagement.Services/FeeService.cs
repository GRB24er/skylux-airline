using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;
using SchoolManagement.Data;

namespace SchoolManagement.Services;

public record FeeBalance(decimal ExpectedGhs, decimal PaidGhs)
{
    public decimal OutstandingGhs => Math.Max(0, ExpectedGhs - PaidGhs);
    public bool FullyPaid => PaidGhs >= ExpectedGhs;
}

public record OutstandingFeeRow(int StudentId, string StudentName, string ClassName, decimal ExpectedGhs, decimal PaidGhs, decimal OutstandingGhs);

/// <summary>Fee billing (from the fee structure), payments, receipts and outstanding-fee reporting.</summary>
public class FeeService
{
    private readonly SchoolDbContext _db;

    public FeeService(SchoolDbContext db) => _db = db;

    /// <summary>Total fees a student owes for a term, from the fee structure for their class level.</summary>
    public async Task<FeeBalance> GetBalanceAsync(int studentId, int termId)
    {
        var student = await _db.Students.Include(s => s.CurrentClass).FirstOrDefaultAsync(s => s.Id == studentId)
            ?? throw new InvalidOperationException($"Student {studentId} not found.");
        if (student.CurrentClass is null)
            return new FeeBalance(0, 0);

        // SQLite has no native decimal SUM — aggregate client-side.
        var expected = (await _db.FeeStructure
            .Where(f => f.TermId == termId && f.Level == student.CurrentClass.Level)
            .Select(f => f.AmountGhs)
            .ToListAsync()).Sum();

        var paid = (await _db.FeePayments
            .Where(p => p.StudentId == studentId && p.TermId == termId)
            .Select(p => p.AmountGhs)
            .ToListAsync()).Sum();

        return new FeeBalance(expected, paid);
    }

    /// <summary>Record a payment and issue a sequential receipt number (RCT-000001…).</summary>
    public async Task<FeePayment> RecordPaymentAsync(
        int studentId, int termId, decimal amountGhs, PaymentMethod method,
        int? feeTypeId = null, int? receivedByStaffId = null, string? notes = null)
    {
        if (amountGhs <= 0)
            throw new ArgumentOutOfRangeException(nameof(amountGhs), "Payment must be positive.");

        var lastReceipt = await _db.FeePayments
            .OrderByDescending(p => p.Id)
            .Select(p => p.ReceiptNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastReceipt is not null && int.TryParse(lastReceipt.Replace("RCT-", ""), out var last))
            nextNumber = last + 1;

        var payment = new FeePayment
        {
            StudentId = studentId,
            TermId = termId,
            FeeTypeId = feeTypeId,
            AmountGhs = amountGhs,
            Method = method,
            ReceiptNumber = $"RCT-{nextNumber:D6}",
            PaidAtUtc = DateTime.UtcNow,
            ReceivedByStaffId = receivedByStaffId,
            Notes = notes
        };
        _db.FeePayments.Add(payment);
        await _db.SaveChangesAsync();
        return payment;
    }

    /// <summary>Students with unpaid balances for a term, optionally restricted to one class.</summary>
    public async Task<List<OutstandingFeeRow>> GetOutstandingAsync(int termId, int? classId = null)
    {
        var studentsQuery = _db.Students
            .Include(s => s.CurrentClass)
            .Where(s => s.Status == StudentStatus.Active && s.CurrentClassId != null);
        if (classId is not null)
            studentsQuery = studentsQuery.Where(s => s.CurrentClassId == classId);

        var students = await studentsQuery.ToListAsync();

        // SQLite has no native decimal SUM — group and sum client-side.
        var structure = (await _db.FeeStructure
            .Where(f => f.TermId == termId)
            .Select(f => new { f.Level, f.AmountGhs })
            .ToListAsync())
            .GroupBy(f => f.Level)
            .ToDictionary(g => g.Key, g => g.Sum(f => f.AmountGhs));

        var paidByStudent = (await _db.FeePayments
            .Where(p => p.TermId == termId)
            .Select(p => new { p.StudentId, p.AmountGhs })
            .ToListAsync())
            .GroupBy(p => p.StudentId)
            .ToDictionary(g => g.Key, g => g.Sum(p => p.AmountGhs));

        var rows = new List<OutstandingFeeRow>();
        foreach (var s in students)
        {
            var expected = structure.GetValueOrDefault(s.CurrentClass!.Level);
            var paid = paidByStudent.GetValueOrDefault(s.Id);
            if (paid < expected)
                rows.Add(new OutstandingFeeRow(s.Id, s.FullName, s.CurrentClass.Name, expected, paid, expected - paid));
        }

        return rows.OrderByDescending(r => r.OutstandingGhs).ToList();
    }

    /// <summary>Total revenue collected in a term.</summary>
    public async Task<decimal> GetTermRevenueAsync(int termId) =>
        (await _db.FeePayments
            .Where(p => p.TermId == termId)
            .Select(p => p.AmountGhs)
            .ToListAsync()).Sum();
}
