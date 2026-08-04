using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;
using SchoolManagement.Data;

namespace SchoolManagement.Services;

public record AttendanceSummary(int Present, int Absent, int Late, int Excused, int TotalDays)
{
    /// <summary>Late counts as present for percentage purposes.</summary>
    public decimal Percentage => TotalDays == 0
        ? 0
        : Math.Round((Present + Late) * 100m / TotalDays, 1);
}

/// <summary>Daily attendance for students and staff, with term summaries.</summary>
public class AttendanceService
{
    private readonly SchoolDbContext _db;

    public AttendanceService(SchoolDbContext db) => _db = db;

    /// <summary>
    /// Bulk-mark a class for one day. Re-marking the same day updates existing rows
    /// instead of duplicating them.
    /// </summary>
    public async Task MarkClassAsync(
        int classId, DateOnly date, IReadOnlyDictionary<int, AttendanceStatus> statusByStudentId,
        int? recordedByStaffId = null)
    {
        var studentIds = statusByStudentId.Keys.ToList();
        var existing = await _db.StudentAttendance
            .Where(a => a.ClassId == classId && a.Date == date && studentIds.Contains(a.StudentId))
            .ToDictionaryAsync(a => a.StudentId);

        foreach (var (studentId, status) in statusByStudentId)
        {
            if (existing.TryGetValue(studentId, out var row))
            {
                row.Status = status;
                row.RecordedByStaffId = recordedByStaffId;
            }
            else
            {
                _db.StudentAttendance.Add(new StudentAttendance
                {
                    StudentId = studentId,
                    ClassId = classId,
                    Date = date,
                    Status = status,
                    RecordedByStaffId = recordedByStaffId
                });
            }
        }

        await _db.SaveChangesAsync();
    }

    public async Task<AttendanceSummary> GetStudentSummaryAsync(int studentId, DateOnly from, DateOnly to)
    {
        var rows = await _db.StudentAttendance
            .Where(a => a.StudentId == studentId && a.Date >= from && a.Date <= to)
            .ToListAsync();

        return Summarize(rows.Select(r => r.Status));
    }

    public async Task MarkStaffAsync(int staffId, DateOnly date, AttendanceStatus status, string? note = null)
    {
        var existing = await _db.StaffAttendance
            .FirstOrDefaultAsync(a => a.StaffId == staffId && a.Date == date);
        if (existing is not null)
        {
            existing.Status = status;
            existing.Note = note;
        }
        else
        {
            _db.StaffAttendance.Add(new StaffAttendance
            {
                StaffId = staffId,
                Date = date,
                Status = status,
                Note = note
            });
        }
        await _db.SaveChangesAsync();
    }

    public static AttendanceSummary Summarize(IEnumerable<AttendanceStatus> statuses)
    {
        int present = 0, absent = 0, late = 0, excused = 0, total = 0;
        foreach (var s in statuses)
        {
            total++;
            switch (s)
            {
                case AttendanceStatus.Present: present++; break;
                case AttendanceStatus.Absent: absent++; break;
                case AttendanceStatus.Late: late++; break;
                case AttendanceStatus.Excused or AttendanceStatus.OnLeave: excused++; break;
            }
        }
        return new AttendanceSummary(present, absent, late, excused, total);
    }
}
