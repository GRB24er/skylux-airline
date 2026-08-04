using System.Net.NetworkInformation;
using System.Security.Cryptography;
using System.Text;

namespace SchoolManagement.Core.Licensing;

/// <summary>
/// Supplies the machine identifiers used to build the hardware fingerprint.
/// Abstracted so the UI can plug in a WMI-based provider on Windows
/// (CPU ID, motherboard serial, disk serial) and tests can supply fixed values.
/// </summary>
public interface IHardwareInfoProvider
{
    /// <summary>MAC address of the primary physical network adapter.</summary>
    string GetMacAddress();

    /// <summary>Processor identifier (WMI Win32_Processor.ProcessorId on Windows).</summary>
    string GetCpuId();

    /// <summary>Motherboard serial number (WMI Win32_BaseBoard.SerialNumber on Windows).</summary>
    string GetMotherboardSerial();

    /// <summary>System-drive serial number (WMI Win32_DiskDrive.SerialNumber on Windows).</summary>
    string GetDiskSerial();
}

/// <summary>
/// Best-effort cross-platform provider. The WinUI app replaces the CPU/board/disk
/// lookups with WMI queries; here they fall back to stable OS identifiers so the
/// fingerprint is still unique and reproducible per machine.
/// </summary>
public class DefaultHardwareInfoProvider : IHardwareInfoProvider
{
    public string GetMacAddress()
    {
        var nic = NetworkInterface.GetAllNetworkInterfaces()
            .Where(n => n.NetworkInterfaceType != NetworkInterfaceType.Loopback &&
                        n.NetworkInterfaceType != NetworkInterfaceType.Tunnel)
            .OrderByDescending(n => n.OperationalStatus == OperationalStatus.Up)
            .FirstOrDefault();
        return nic?.GetPhysicalAddress().ToString() ?? "NO-MAC";
    }

    public string GetCpuId() => Environment.ProcessorCount + "|" +
        (Environment.GetEnvironmentVariable("PROCESSOR_IDENTIFIER") ?? RuntimeIdentity());

    public string GetMotherboardSerial() => MachineGuid();

    public string GetDiskSerial() => MachineGuid();

    private static string RuntimeIdentity() =>
        System.Runtime.InteropServices.RuntimeInformation.OSDescription;

    private static string MachineGuid()
    {
        // /etc/machine-id on Linux; the WinUI provider reads real hardware serials via WMI.
        const string machineIdPath = "/etc/machine-id";
        if (File.Exists(machineIdPath))
            return File.ReadAllText(machineIdPath).Trim();
        return Environment.MachineName;
    }
}

/// <summary>
/// Builds the unique hardware fingerprint that a license is bound to:
/// SHA-256 over MAC + CPU ID + motherboard serial + disk serial.
/// </summary>
public static class HardwareFingerprint
{
    public static string Compute(IHardwareInfoProvider provider)
    {
        var raw = string.Join("|",
            provider.GetMacAddress(),
            provider.GetCpuId(),
            provider.GetMotherboardSerial(),
            provider.GetDiskSerial());

        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(raw));
        return Convert.ToHexString(hash);
    }
}
