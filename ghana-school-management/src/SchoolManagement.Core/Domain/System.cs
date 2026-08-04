namespace SchoolManagement.Core.Domain;

/// <summary>School-wide configuration, stored as a single row.</summary>
public class SchoolSettings
{
    public int Id { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? MottoOrCrestPath { get; set; }

    /// <summary>Continuous-assessment weight in the final grade (default 0.40).</summary>
    public decimal CaWeight { get; set; } = 0.40m;

    /// <summary>End-of-term exam weight in the final grade (default 0.60).</summary>
    public decimal ExamWeight { get; set; } = 0.60m;

    public string Currency { get; set; } = "GHS";
    public string Language { get; set; } = "en";
}

/// <summary>The locally cached software license record.</summary>
public class LicenseRecord
{
    public int Id { get; set; }
    public string LicenseKey { get; set; } = string.Empty;
    public string SchoolName { get; set; } = string.Empty;
    public string HardwareFingerprint { get; set; } = string.Empty;
    public LicenseStatus Status { get; set; }
    public DateTime IssuedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? ActivatedAtUtc { get; set; }
}

/// <summary>An immutable audit trail entry.</summary>
public class AuditLog
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime TimestampUtc { get; set; }
}
