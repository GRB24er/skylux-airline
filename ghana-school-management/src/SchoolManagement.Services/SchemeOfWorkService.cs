using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;
using SchoolManagement.Data;

namespace SchoolManagement.Services;

/// <summary>The SOW lifecycle: draft → submitted → approved / revision requested.</summary>
public class SchemeOfWorkService
{
    private readonly SchoolDbContext _db;

    public SchemeOfWorkService(SchoolDbContext db) => _db = db;

    /// <summary>Create a draft SOW pre-populated with empty weekly slots.</summary>
    public async Task<SchemeOfWork> CreateDraftAsync(int staffId, int subjectId, int classId, int termId, int weekCount = 12)
    {
        var duplicate = await _db.SchemesOfWork.AnyAsync(s =>
            s.StaffId == staffId && s.SubjectId == subjectId && s.ClassId == classId && s.TermId == termId);
        if (duplicate)
            throw new InvalidOperationException("A Scheme of Work already exists for this subject/class/term.");

        var sow = new SchemeOfWork
        {
            StaffId = staffId,
            SubjectId = subjectId,
            ClassId = classId,
            TermId = termId,
            Status = SowStatus.Draft
        };
        for (var week = 1; week <= weekCount; week++)
            sow.Weeks.Add(new SowWeek { WeekNumber = week });

        _db.SchemesOfWork.Add(sow);
        await _db.SaveChangesAsync();
        return sow;
    }

    public async Task SubmitAsync(int sowId)
    {
        var sow = await LoadAsync(sowId);
        if (sow.Status is not (SowStatus.Draft or SowStatus.RevisionRequested))
            throw new InvalidOperationException($"Cannot submit a SOW in state {sow.Status}.");
        if (sow.Weeks.All(w => string.IsNullOrWhiteSpace(w.Topic)))
            throw new InvalidOperationException("Cannot submit an empty Scheme of Work.");

        sow.Status = SowStatus.Submitted;
        sow.SubmittedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task ReviewAsync(int sowId, int reviewerStaffId, bool approve, string? comment = null)
    {
        var sow = await LoadAsync(sowId);
        if (sow.Status != SowStatus.Submitted)
            throw new InvalidOperationException("Only a submitted SOW can be reviewed.");

        sow.Status = approve ? SowStatus.Approved : SowStatus.RevisionRequested;
        sow.ReviewedAtUtc = DateTime.UtcNow;
        sow.ReviewedByStaffId = reviewerStaffId;
        sow.ReviewComment = comment;
        await _db.SaveChangesAsync();
    }

    /// <summary>Fraction of weeks the teacher has marked completed (0-1).</summary>
    public async Task<decimal> GetProgressAsync(int sowId)
    {
        var sow = await LoadAsync(sowId);
        if (sow.Weeks.Count == 0) return 0;
        return Math.Round((decimal)sow.Weeks.Count(w => w.IsCompleted) / sow.Weeks.Count, 2);
    }

    private async Task<SchemeOfWork> LoadAsync(int sowId) =>
        await _db.SchemesOfWork.Include(s => s.Weeks).FirstOrDefaultAsync(s => s.Id == sowId)
        ?? throw new InvalidOperationException($"Scheme of Work {sowId} not found.");
}
