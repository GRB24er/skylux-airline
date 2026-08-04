using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace SchoolManagement.Core.Licensing;

/// <summary>The decrypted contents of a license file.</summary>
public record LicensePayload(
    string LicenseKey,
    string SchoolName,
    string HardwareFingerprint,
    DateTime IssuedAtUtc,
    DateTime ExpiresAtUtc);

public enum LicenseValidationResult
{
    Valid = 0,
    NotActivated = 1,
    Expired = 2,
    HardwareMismatch = 3,
    Tampered = 4,
    TrialActive = 5,
    TrialExpired = 6
}

/// <summary>
/// Handles license key generation/verification, the AES-256-encrypted local
/// license cache, hardware binding, and the 30-day trial window.
/// </summary>
public class LicenseManager
{
    public const int TrialDays = 30;
    private const string KeyAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

    private readonly byte[] _encryptionKey;

    /// <param name="encryptionSecret">
    /// Vendor secret baked into the application; the AES-256 key is derived from it.
    /// </param>
    public LicenseManager(string encryptionSecret)
    {
        if (string.IsNullOrWhiteSpace(encryptionSecret))
            throw new ArgumentException("Encryption secret required.", nameof(encryptionSecret));
        _encryptionKey = SHA256.HashData(Encoding.UTF8.GetBytes(encryptionSecret));
    }

    // ---- License keys -------------------------------------------------------

    /// <summary>Generate a key of the form XXXXX-XXXXX-XXXXX-XXXXX with an embedded checksum character.</summary>
    public static string GenerateLicenseKey()
    {
        var body = new StringBuilder(); // 19 random chars + 1 checksum char = 4 groups of 5
        for (var i = 0; i < 19; i++)
            body.Append(KeyAlphabet[RandomNumberGenerator.GetInt32(KeyAlphabet.Length)]);

        var withChecksum = body.ToString() + ChecksumChar(body.ToString());
        return string.Join("-",
            withChecksum[..5], withChecksum[5..10], withChecksum[10..15], withChecksum[15..20]);
    }

    /// <summary>Offline structural check that a typed key is well-formed (checksum matches).</summary>
    public static bool IsWellFormedKey(string key)
    {
        if (string.IsNullOrWhiteSpace(key)) return false;
        var compact = key.Replace("-", "").Trim().ToUpperInvariant();
        if (compact.Length != 20) return false;
        if (compact.Any(c => !KeyAlphabet.Contains(c))) return false;
        return ChecksumChar(compact[..19]) == compact[19];
    }

    private static char ChecksumChar(string body)
    {
        var sum = body.Aggregate(0, (acc, c) => acc + KeyAlphabet.IndexOf(c));
        return KeyAlphabet[sum % KeyAlphabet.Length];
    }

    // ---- Encrypted license file --------------------------------------------

    /// <summary>Encrypt a license payload with AES-256-GCM (authenticated, tamper-evident).</summary>
    public byte[] EncryptLicense(LicensePayload payload)
    {
        var plaintext = JsonSerializer.SerializeToUtf8Bytes(payload);
        var nonce = RandomNumberGenerator.GetBytes(12);
        var ciphertext = new byte[plaintext.Length];
        var tag = new byte[16];

        using var aes = new AesGcm(_encryptionKey, tag.Length);
        aes.Encrypt(nonce, plaintext, ciphertext, tag);

        var output = new byte[nonce.Length + tag.Length + ciphertext.Length];
        nonce.CopyTo(output, 0);
        tag.CopyTo(output, nonce.Length);
        ciphertext.CopyTo(output, nonce.Length + tag.Length);
        return output;
    }

    /// <summary>Decrypt a license file. Returns null when the file is corrupt or tampered with.</summary>
    public LicensePayload? DecryptLicense(byte[] data)
    {
        if (data.Length < 12 + 16 + 1) return null;
        try
        {
            var nonce = data[..12];
            var tag = data[12..28];
            var ciphertext = data[28..];
            var plaintext = new byte[ciphertext.Length];

            using var aes = new AesGcm(_encryptionKey, tag.Length);
            aes.Decrypt(nonce, ciphertext, tag, plaintext);
            return JsonSerializer.Deserialize<LicensePayload>(plaintext);
        }
        catch (Exception e) when (e is CryptographicException or JsonException)
        {
            return null;
        }
    }

    // ---- Activation & validation -------------------------------------------

    /// <summary>
    /// Activate a license for this machine: bind the key to the hardware fingerprint
    /// and produce the encrypted license file to cache locally.
    /// In production the key is first verified against the vendor's license server.
    /// </summary>
    public byte[] Activate(string licenseKey, string schoolName, string hardwareFingerprint, DateTime expiresAtUtc)
    {
        if (!IsWellFormedKey(licenseKey))
            throw new ArgumentException("License key is not valid.", nameof(licenseKey));

        var payload = new LicensePayload(
            licenseKey.Trim().ToUpperInvariant(),
            schoolName,
            hardwareFingerprint,
            DateTime.UtcNow,
            expiresAtUtc);

        return EncryptLicense(payload);
    }

    /// <summary>Validate the cached license file against the current machine.</summary>
    public LicenseValidationResult Validate(byte[]? licenseFile, string currentHardwareFingerprint, DateTime nowUtc)
    {
        if (licenseFile is null || licenseFile.Length == 0)
            return LicenseValidationResult.NotActivated;

        var payload = DecryptLicense(licenseFile);
        if (payload is null)
            return LicenseValidationResult.Tampered;

        if (!string.Equals(payload.HardwareFingerprint, currentHardwareFingerprint, StringComparison.OrdinalIgnoreCase))
            return LicenseValidationResult.HardwareMismatch;

        if (nowUtc > payload.ExpiresAtUtc)
            return LicenseValidationResult.Expired;

        return LicenseValidationResult.Valid;
    }

    // ---- Trial --------------------------------------------------------------

    /// <summary>
    /// Evaluate the 30-day trial from the recorded first-run timestamp.
    /// </summary>
    public static LicenseValidationResult ValidateTrial(DateTime firstRunUtc, DateTime nowUtc)
    {
        // A first-run stamp in the future means the clock was rolled back — end the trial.
        if (firstRunUtc > nowUtc.AddDays(1))
            return LicenseValidationResult.TrialExpired;

        return (nowUtc - firstRunUtc).TotalDays <= TrialDays
            ? LicenseValidationResult.TrialActive
            : LicenseValidationResult.TrialExpired;
    }

    public static int TrialDaysRemaining(DateTime firstRunUtc, DateTime nowUtc)
    {
        var remaining = TrialDays - (int)Math.Floor((nowUtc - firstRunUtc).TotalDays);
        return Math.Max(0, remaining);
    }
}
