using System.Management;
using SchoolManagement.Core.Licensing;

namespace SchoolManagement.App;

/// <summary>
/// Windows implementation of <see cref="IHardwareInfoProvider"/> using WMI:
/// real CPU ID, motherboard serial and disk serial, as required for the
/// hardware-locked license fingerprint.
/// </summary>
public class WmiHardwareInfoProvider : IHardwareInfoProvider
{
    public string GetMacAddress() =>
        QueryFirst("Win32_NetworkAdapter WHERE PhysicalAdapter = TRUE", "MACAddress");

    public string GetCpuId() =>
        QueryFirst("Win32_Processor", "ProcessorId");

    public string GetMotherboardSerial() =>
        QueryFirst("Win32_BaseBoard", "SerialNumber");

    public string GetDiskSerial() =>
        QueryFirst("Win32_DiskDrive WHERE Index = 0", "SerialNumber");

    private static string QueryFirst(string from, string property)
    {
        try
        {
            using var searcher = new ManagementObjectSearcher($"SELECT {property} FROM {from}");
            foreach (var item in searcher.Get())
            {
                var value = item[property]?.ToString()?.Trim();
                if (!string.IsNullOrEmpty(value))
                    return value;
            }
        }
        catch (ManagementException)
        {
            // Fall through to the sentinel below; the fingerprint still combines
            // three other components.
        }
        return $"UNKNOWN-{property}";
    }
}
