using System.Text;
using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;
using SchoolManagement.Data;

namespace SchoolManagement.Services;

/// <summary>
/// One-click report card generation for a whole class: aggregates term grades,
/// class position and attendance into stored <see cref="ReportCard"/> rows,
/// and renders a printable text version (the WinUI app renders the same data to PDF).
/// </summary>
public class ReportCardService
{
    private readonly SchoolDbContext _db;
    private readonly GradeService _grades;
    private readonly AttendanceService _attendance;

    public ReportCardService(SchoolDbContext db, GradeService grades, AttendanceService attendance)
    {
        _db = db;
        _grades = grades;
        _attendance = attendance;
    }

    /// <summary>Generate (or regenerate) report cards for every active student in a class.</summary>
    public async Task<List<ReportCard>> GenerateForClassAsync(int classId, int termId)
    {
        var term = await _db.Terms.FindAsync(termId)
            ?? throw new InvalidOperationException($"Term {termId} not found.");

        var standings = await _grades.ComputeClassStandingsAsync(classId, termId);
        var classSize = standings.Count;
        var schoolDays = CountWeekdays(term.StartDate, term.EndDate);

        var cards = new List<ReportCard>();
        foreach (var (studentId, average, position) in standings)
        {
            var attendance = await _attendance.GetStudentSummaryAsync(studentId, term.StartDate, term.EndDate);

            var card = await _db.ReportCards
                .FirstOrDefaultAsync(r => r.StudentId == studentId && r.TermId == termId);
            if (card is null)
            {
                card = new ReportCard { StudentId = studentId, TermId = termId };
                _db.ReportCards.Add(card);
            }

            card.OverallAverage = average;
            card.ClassPosition = position;
            card.ClassSize = classSize;
            card.DaysPresent = attendance.Present + attendance.Late;
            card.DaysInTerm = attendance.TotalDays > 0 ? attendance.TotalDays : schoolDays;
            card.GeneratedAtUtc = DateTime.UtcNow;
            cards.Add(card);
        }

        await _db.SaveChangesAsync();
        return cards;
    }

    /// <summary>Render one student's report card as printable text.</summary>
    public async Task<string> RenderTextAsync(int studentId, int termId)
    {
        var card = await _db.ReportCards
            .Include(r => r.Student)
            .Include(r => r.Term!).ThenInclude(t => t.AcademicYear)
            .FirstOrDefaultAsync(r => r.StudentId == studentId && r.TermId == termId)
            ?? throw new InvalidOperationException("Report card not generated yet.");

        var settings = await _db.Settings.FirstOrDefaultAsync();
        var grades = await _db.TermGrades
            .Include(g => g.Subject)
            .Where(g => g.StudentId == studentId && g.TermId == termId)
            .OrderBy(g => g.Subject!.Name)
            .ToListAsync();

        var student = card.Student!;
        var sb = new StringBuilder();
        sb.AppendLine(settings?.SchoolName ?? "School");
        sb.AppendLine($"TERMINAL REPORT — {card.Term?.AcademicYear?.Name} Term {(int)(card.Term?.Number ?? 0)}");
        sb.AppendLine(new string('=', 64));
        sb.AppendLine($"Student : {student.FullName} ({student.IndexNumber})");
        sb.AppendLine($"Position: {card.ClassPosition} out of {card.ClassSize}");
        sb.AppendLine($"Average : {card.OverallAverage:F2}%");
        sb.AppendLine($"Attendance: {card.DaysPresent}/{card.DaysInTerm} days");
        sb.AppendLine(new string('-', 64));
        sb.AppendLine($"{"Subject",-32}{"CA(40%)",8}{"Exam(60%)",10}{"Final",7}  Grade");
        foreach (var g in grades)
        {
            sb.AppendLine(
                $"{g.Subject?.Name,-32}{g.CaScore,8:F1}{g.ExamScore,10:F1}{g.FinalScore,7:F1}  {g.GradeLabel} ({g.Remark})");
        }
        sb.AppendLine(new string('-', 64));
        if (!string.IsNullOrWhiteSpace(card.ClassTeacherComment))
            sb.AppendLine($"Class teacher: {card.ClassTeacherComment}");
        if (!string.IsNullOrWhiteSpace(card.HeadteacherComment))
            sb.AppendLine($"Headteacher : {card.HeadteacherComment}");
        sb.AppendLine($"Promotion status: {card.Promotion}");
        return sb.ToString();
    }

    private static int CountWeekdays(DateOnly from, DateOnly to)
    {
        var days = 0;
        for (var d = from; d <= to; d = d.AddDays(1))
            if (d.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday))
                days++;
        return days;
    }
}
