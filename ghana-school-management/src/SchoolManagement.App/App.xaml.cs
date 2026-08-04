using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.UI.Xaml;
using SchoolManagement.Core.Exams;
using SchoolManagement.Core.Licensing;
using SchoolManagement.Data;
using SchoolManagement.Services;

namespace SchoolManagement.App;

public partial class App : Application
{
    public static IServiceProvider Services { get; private set; } = null!;
    private Window? _window;

    public App()
    {
        InitializeComponent();
        Services = ConfigureServices();
    }

    protected override async void OnLaunched(LaunchActivatedEventArgs args)
    {
        // Ensure the local SQLite database exists and holds the baseline data.
        using (var scope = Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<SchoolDbContext>();
            await SeedData.InitializeAsync(db);
        }

        _window = new MainWindow();
        _window.Activate();
    }

    private static IServiceProvider ConfigureServices()
    {
        var dataDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "GhanaSchoolManagement");
        Directory.CreateDirectory(dataDir);
        var dbPath = Path.Combine(dataDir, "school.db");

        var services = new ServiceCollection();
        services.AddDbContext<SchoolDbContext>(o => o.UseSqlite($"Data Source={dbPath}"));

        services.AddSingleton<IHardwareInfoProvider, WmiHardwareInfoProvider>();
        services.AddSingleton(new LicenseManager(LicenseConfig.VendorSecret));
        services.AddSingleton<ExamGenerator>();

        services.AddScoped<AuthService>();
        services.AddScoped<StudentService>();
        services.AddScoped<AttendanceService>();
        services.AddScoped<FeeService>();
        services.AddScoped<ExamService>();
        services.AddScoped<GradeService>();
        services.AddScoped<SchemeOfWorkService>();
        services.AddScoped<ReportCardService>();

        return services.BuildServiceProvider();
    }
}

internal static class LicenseConfig
{
    // In production this is embedded via an obfuscated build step, not source.
    public const string VendorSecret = "REPLACE-WITH-VENDOR-SECRET";
}
