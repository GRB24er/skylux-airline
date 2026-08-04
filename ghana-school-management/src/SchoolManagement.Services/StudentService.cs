using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;
using SchoolManagement.Data;

namespace SchoolManagement.Services;

/// <summary>Enrollment, index numbers, class assignment and end-of-year promotion.</summary>
public class StudentService
{
    private readonly SchoolDbContext _db;

    public StudentService(SchoolDbContext db) => _db = db;

    /// <summary>Enroll a student, generating a GES-style index number (e.g. GES-2025-0001).</summary>
    public async Task<Student> EnrollAsync(Student student, int classId)
    {
        var year = student.EnrollmentDate.Year;
        var prefix = $"GES-{year}-";
        var lastForYear = await _db.Students
            .Where(s => s.IndexNumber.StartsWith(prefix))
            .OrderByDescending(s => s.IndexNumber)
            .Select(s => s.IndexNumber)
            .FirstOrDefaultAsync();

        var next = 1;
        if (lastForYear is not null && int.TryParse(lastForYear[prefix.Length..], out var lastSeq))
            next = lastSeq + 1;

        student.IndexNumber = $"{prefix}{next:D4}";
        student.CurrentClassId = classId;
        student.Status = StudentStatus.Active;
        _db.Students.Add(student);
        await _db.SaveChangesAsync();
        return student;
    }

    /// <summary>
    /// Promote every active student in a class to the next level at year end.
    /// JHS 3 students graduate; students listed in <paramref name="retainStudentIds"/> stay.
    /// </summary>
    public async Task<(int promoted, int retained, int graduated)> PromoteClassAsync(
        int classId, IReadOnlySet<int>? retainStudentIds = null)
    {
        retainStudentIds ??= new HashSet<int>();
        var currentClass = await _db.Classes.FindAsync(classId)
            ?? throw new InvalidOperationException($"Class {classId} not found.");

        var students = await _db.Students
            .Where(s => s.CurrentClassId == classId && s.Status == StudentStatus.Active)
            .ToListAsync();

        int promoted = 0, retained = 0, graduated = 0;

        if (currentClass.Level == ClassLevel.JHS3)
        {
            foreach (var s in students.Where(s => !retainStudentIds.Contains(s.Id)))
            {
                s.Status = StudentStatus.Graduated;
                s.CompletionDate = DateOnly.FromDateTime(DateTime.UtcNow);
                s.CurrentClassId = null;
                graduated++;
            }
            retained = students.Count - graduated;
        }
        else
        {
            var nextLevel = (ClassLevel)((int)currentClass.Level + 1);
            var nextClass = await _db.Classes.FirstOrDefaultAsync(c => c.Level == nextLevel)
                ?? throw new InvalidOperationException($"No class exists at level {nextLevel}.");

            foreach (var s in students)
            {
                if (retainStudentIds.Contains(s.Id))
                {
                    retained++;
                    continue;
                }
                s.CurrentClassId = nextClass.Id;
                promoted++;
            }
        }

        await _db.SaveChangesAsync();
        return (promoted, retained, graduated);
    }
}
