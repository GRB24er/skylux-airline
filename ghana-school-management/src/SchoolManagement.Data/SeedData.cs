using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;
using SchoolManagement.Core.Security;

namespace SchoolManagement.Data;

/// <summary>
/// Seeds reference data every Ghanaian basic school needs: GES subjects,
/// the KG-JHS3 class ladder, common fee types, the three-term calendar,
/// school settings, and a default admin account.
/// </summary>
public static class SeedData
{
    public static readonly (string Name, string Code, bool IsCore)[] GesSubjects =
    {
        ("English Language", "ENG", true),
        ("Mathematics", "MATH", true),
        ("Science", "SCI", true),
        ("Social Studies", "SOC", true),
        ("Religious & Moral Education", "RME", true),
        ("Computing / ICT", "ICT", true),
        ("Creative Arts & Design", "CAD", false),
        ("Career Technology", "CTECH", false),
        ("Ghanaian Language", "GHL", true),
        ("Physical & Health Education", "PHE", false),
        ("French", "FRE", false)
    };

    public static readonly (string Name, ClassLevel Level)[] ClassLadder =
    {
        ("KG 1", ClassLevel.KG1),
        ("KG 2", ClassLevel.KG2),
        ("Primary 1", ClassLevel.Primary1),
        ("Primary 2", ClassLevel.Primary2),
        ("Primary 3", ClassLevel.Primary3),
        ("Primary 4", ClassLevel.Primary4),
        ("Primary 5", ClassLevel.Primary5),
        ("Primary 6", ClassLevel.Primary6),
        ("JHS 1", ClassLevel.JHS1),
        ("JHS 2", ClassLevel.JHS2),
        ("JHS 3", ClassLevel.JHS3)
    };

    public static readonly string[] CommonFeeTypes =
    {
        "Tuition", "PTA", "Books", "Uniforms", "Feeding", "Transport", "Sports", "Examination"
    };

    /// <summary>Ensure the database exists and contains the baseline reference data.</summary>
    public static async Task InitializeAsync(SchoolDbContext db, string adminPassword = "ChangeMe123!")
    {
        await db.Database.EnsureCreatedAsync();

        if (!await db.Subjects.AnyAsync())
        {
            db.Subjects.AddRange(GesSubjects.Select(s => new Subject
            {
                Name = s.Name,
                Code = s.Code,
                IsCore = s.IsCore
            }));
        }

        if (!await db.Classes.AnyAsync())
        {
            db.Classes.AddRange(ClassLadder.Select(c => new SchoolClass
            {
                Name = c.Name,
                Level = c.Level
            }));
        }

        if (!await db.FeeTypes.AnyAsync())
        {
            db.FeeTypes.AddRange(CommonFeeTypes.Select(f => new FeeType { Name = f }));
        }

        if (!await db.AcademicYears.AnyAsync())
        {
            var year = new AcademicYear
            {
                Name = "2025/2026",
                StartDate = new DateOnly(2025, 9, 9),
                EndDate = new DateOnly(2026, 7, 31),
                IsCurrent = true,
                Terms =
                {
                    new Term { Number = TermNumber.First, StartDate = new DateOnly(2025, 9, 9), EndDate = new DateOnly(2025, 12, 19), IsCurrent = true },
                    new Term { Number = TermNumber.Second, StartDate = new DateOnly(2026, 1, 6), EndDate = new DateOnly(2026, 4, 10) },
                    new Term { Number = TermNumber.Third, StartDate = new DateOnly(2026, 5, 5), EndDate = new DateOnly(2026, 7, 31) }
                }
            };
            db.AcademicYears.Add(year);
        }

        if (!await db.Settings.AnyAsync())
        {
            db.Settings.Add(new SchoolSettings
            {
                SchoolName = "My School",
                CaWeight = 0.40m,
                ExamWeight = 0.60m,
                Currency = "GHS",
                Language = "en"
            });
        }

        if (!await db.Users.AnyAsync())
        {
            db.Users.Add(new User
            {
                Username = "admin",
                PasswordHash = PasswordHasher.Hash(adminPassword),
                Role = UserRole.Admin,
                FullName = "System Administrator",
                CreatedAtUtc = DateTime.UtcNow
            });
        }

        await db.SaveChangesAsync();
    }
}
