using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;
using SchoolManagement.Core.Security;
using SchoolManagement.Data;

namespace SchoolManagement.Services;

public record LoginResult(bool Success, User? User, string? Error);

/// <summary>Authentication and user administration, with audit logging.</summary>
public class AuthService
{
    private readonly SchoolDbContext _db;

    public AuthService(SchoolDbContext db) => _db = db;

    public async Task<LoginResult> LoginAsync(string username, string password)
    {
        var user = await _db.Users
            .Include(u => u.LinkedStudent)
            .Include(u => u.LinkedStaff)
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user is null || !PasswordHasher.Verify(password, user.PasswordHash))
        {
            await AuditAsync(null, "LOGIN_FAILED", $"username={username}");
            return new LoginResult(false, null, "Invalid username or password.");
        }

        if (!user.IsActive)
        {
            await AuditAsync(user.Id, "LOGIN_BLOCKED", "account disabled");
            return new LoginResult(false, null, "This account has been disabled.");
        }

        user.LastLoginUtc = DateTime.UtcNow;
        await AuditAsync(user.Id, "LOGIN", null);
        return new LoginResult(true, user, null);
    }

    public async Task<User> CreateUserAsync(
        string username, string password, UserRole role, string fullName,
        int? linkedStudentId = null, int? linkedStaffId = null, int? actingUserId = null)
    {
        if (await _db.Users.AnyAsync(u => u.Username == username))
            throw new InvalidOperationException($"Username '{username}' is already taken.");

        var user = new User
        {
            Username = username,
            PasswordHash = PasswordHasher.Hash(password),
            Role = role,
            FullName = fullName,
            LinkedStudentId = linkedStudentId,
            LinkedStaffId = linkedStaffId,
            CreatedAtUtc = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await AuditAsync(actingUserId, "USER_CREATED", $"username={username}, role={role}");
        return user;
    }

    public async Task ResetPasswordAsync(int userId, string newPassword, int? actingUserId = null)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException($"User {userId} not found.");
        user.PasswordHash = PasswordHasher.Hash(newPassword);
        await AuditAsync(actingUserId, "PASSWORD_RESET", $"userId={userId}");
    }

    private async Task AuditAsync(int? userId, string action, string? details)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Action = action,
            Details = details,
            TimestampUtc = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }
}

/// <summary>
/// Central role-permission map. UI screens and services consult this so each
/// role sees only what the specification allows.
/// </summary>
public static class Permissions
{
    public enum Action
    {
        ViewAllFinance,
        RecordFeePayment,
        EnterGrades,
        MarkSubjectiveExams,
        MarkAttendance,
        ApproveSchemeOfWork,
        ManageUsers,
        ManageSystemSettings,
        ManageLicense,
        ViewAllStudents,
        ViewOwnChildOnly,
        MakePromotionDecisions,
        ManageQuestionBank,
        GenerateReports
    }

    private static readonly Dictionary<UserRole, HashSet<Action>> Map = new()
    {
        [UserRole.Owner] = new()
        {
            Action.ViewAllFinance, Action.ViewAllStudents, Action.ManageUsers,
            Action.ManageSystemSettings, Action.ManageLicense, Action.GenerateReports
        },
        [UserRole.Headteacher] = new()
        {
            Action.ViewAllStudents, Action.ApproveSchemeOfWork,
            Action.MakePromotionDecisions, Action.GenerateReports
        },
        [UserRole.Teacher] = new()
        {
            Action.EnterGrades, Action.MarkSubjectiveExams, Action.MarkAttendance,
            Action.ManageQuestionBank, Action.GenerateReports
        },
        [UserRole.Accountant] = new()
        {
            Action.ViewAllFinance, Action.RecordFeePayment, Action.GenerateReports
        },
        [UserRole.Admin] = new()
        {
            Action.ManageUsers, Action.ManageSystemSettings, Action.ManageLicense
        },
        [UserRole.Parent] = new() { Action.ViewOwnChildOnly },
        [UserRole.Student] = new() { Action.ViewOwnChildOnly }
    };

    public static bool Can(UserRole role, Action action) =>
        Map.TryGetValue(role, out var actions) && actions.Contains(action);
}
