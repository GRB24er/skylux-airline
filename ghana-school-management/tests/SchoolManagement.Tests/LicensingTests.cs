using SchoolManagement.Core.Licensing;
using SchoolManagement.Core.Security;
using Xunit;

namespace SchoolManagement.Tests;

public class LicenseManagerTests
{
    private const string Secret = "test-vendor-secret";
    private readonly LicenseManager _manager = new(Secret);

    [Fact]
    public void Generated_keys_are_well_formed()
    {
        for (var i = 0; i < 50; i++)
        {
            var key = LicenseManager.GenerateLicenseKey();
            Assert.Matches(@"^[A-Z2-9]{5}-[A-Z2-9]{5}-[A-Z2-9]{5}-[A-Z2-9]{5}$", key);
            Assert.True(LicenseManager.IsWellFormedKey(key));
        }
    }

    [Fact]
    public void Corrupting_a_key_fails_the_checksum()
    {
        var key = LicenseManager.GenerateLicenseKey();
        var chars = key.ToCharArray();
        chars[0] = chars[0] == 'A' ? 'B' : 'A';
        Assert.False(LicenseManager.IsWellFormedKey(new string(chars)));
    }

    [Fact]
    public void Activate_then_validate_succeeds_on_same_hardware()
    {
        var key = LicenseManager.GenerateLicenseKey();
        var file = _manager.Activate(key, "Test School", "FINGERPRINT-1", DateTime.UtcNow.AddYears(1));

        var result = _manager.Validate(file, "FINGERPRINT-1", DateTime.UtcNow);
        Assert.Equal(LicenseValidationResult.Valid, result);
    }

    [Fact]
    public void Validation_fails_on_different_hardware()
    {
        var key = LicenseManager.GenerateLicenseKey();
        var file = _manager.Activate(key, "Test School", "FINGERPRINT-1", DateTime.UtcNow.AddYears(1));

        var result = _manager.Validate(file, "FINGERPRINT-OTHER-PC", DateTime.UtcNow);
        Assert.Equal(LicenseValidationResult.HardwareMismatch, result);
    }

    [Fact]
    public void Validation_fails_after_expiry()
    {
        var key = LicenseManager.GenerateLicenseKey();
        var file = _manager.Activate(key, "Test School", "FP", DateTime.UtcNow.AddDays(-1));

        Assert.Equal(LicenseValidationResult.Expired, _manager.Validate(file, "FP", DateTime.UtcNow));
    }

    [Fact]
    public void Tampered_license_file_is_rejected()
    {
        var key = LicenseManager.GenerateLicenseKey();
        var file = _manager.Activate(key, "Test School", "FP", DateTime.UtcNow.AddYears(1));
        file[^1] ^= 0xFF;

        Assert.Equal(LicenseValidationResult.Tampered, _manager.Validate(file, "FP", DateTime.UtcNow));
    }

    [Fact]
    public void License_encrypted_with_different_secret_cannot_be_read()
    {
        var key = LicenseManager.GenerateLicenseKey();
        var file = new LicenseManager("other-secret").Activate(key, "S", "FP", DateTime.UtcNow.AddYears(1));

        Assert.Equal(LicenseValidationResult.Tampered, _manager.Validate(file, "FP", DateTime.UtcNow));
    }

    [Fact]
    public void Missing_license_reports_not_activated()
    {
        Assert.Equal(LicenseValidationResult.NotActivated, _manager.Validate(null, "FP", DateTime.UtcNow));
        Assert.Equal(LicenseValidationResult.NotActivated, _manager.Validate(Array.Empty<byte>(), "FP", DateTime.UtcNow));
    }

    [Fact]
    public void Trial_is_active_within_30_days_and_expires_after()
    {
        var now = DateTime.UtcNow;
        Assert.Equal(LicenseValidationResult.TrialActive, LicenseManager.ValidateTrial(now.AddDays(-10), now));
        Assert.Equal(LicenseValidationResult.TrialExpired, LicenseManager.ValidateTrial(now.AddDays(-31), now));
        Assert.Equal(20, LicenseManager.TrialDaysRemaining(now.AddDays(-10), now));
    }

    [Fact]
    public void Clock_rollback_ends_the_trial()
    {
        var now = DateTime.UtcNow;
        Assert.Equal(LicenseValidationResult.TrialExpired, LicenseManager.ValidateTrial(now.AddDays(10), now));
    }
}

public class HardwareFingerprintTests
{
    private class FakeProvider : IHardwareInfoProvider
    {
        public string Mac = "AA:BB:CC", Cpu = "CPU1", Board = "MB1", Disk = "DISK1";
        public string GetMacAddress() => Mac;
        public string GetCpuId() => Cpu;
        public string GetMotherboardSerial() => Board;
        public string GetDiskSerial() => Disk;
    }

    [Fact]
    public void Same_hardware_produces_same_fingerprint()
    {
        var a = HardwareFingerprint.Compute(new FakeProvider());
        var b = HardwareFingerprint.Compute(new FakeProvider());
        Assert.Equal(a, b);
        Assert.Equal(64, a.Length); // SHA-256 hex
    }

    [Fact]
    public void Any_component_change_changes_the_fingerprint()
    {
        var baseline = HardwareFingerprint.Compute(new FakeProvider());
        Assert.NotEqual(baseline, HardwareFingerprint.Compute(new FakeProvider { Mac = "XX" }));
        Assert.NotEqual(baseline, HardwareFingerprint.Compute(new FakeProvider { Cpu = "XX" }));
        Assert.NotEqual(baseline, HardwareFingerprint.Compute(new FakeProvider { Board = "XX" }));
        Assert.NotEqual(baseline, HardwareFingerprint.Compute(new FakeProvider { Disk = "XX" }));
    }
}

public class PasswordHasherTests
{
    [Fact]
    public void Correct_password_verifies_and_wrong_password_fails()
    {
        var hash = PasswordHasher.Hash("S3cret!");
        Assert.True(PasswordHasher.Verify("S3cret!", hash));
        Assert.False(PasswordHasher.Verify("s3cret!", hash));
    }

    [Fact]
    public void Same_password_gets_different_salt_each_time()
    {
        Assert.NotEqual(PasswordHasher.Hash("abc123"), PasswordHasher.Hash("abc123"));
    }

    [Fact]
    public void Malformed_stored_hash_never_verifies()
    {
        Assert.False(PasswordHasher.Verify("x", "not-a-hash"));
        Assert.False(PasswordHasher.Verify("x", "pbkdf2$bad$AA$BB"));
        Assert.False(PasswordHasher.Verify("x", ""));
    }
}
