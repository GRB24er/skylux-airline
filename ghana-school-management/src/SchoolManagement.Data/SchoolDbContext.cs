using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;

namespace SchoolManagement.Data;

public class SchoolDbContext : DbContext
{
    public SchoolDbContext(DbContextOptions<SchoolDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<StaffMember> Staff => Set<StaffMember>();
    public DbSet<User> Users => Set<User>();
    public DbSet<SchoolClass> Classes => Set<SchoolClass>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
    public DbSet<Term> Terms => Set<Term>();
    public DbSet<TeachingAssignment> TeachingAssignments => Set<TeachingAssignment>();
    public DbSet<SchemeOfWork> SchemesOfWork => Set<SchemeOfWork>();
    public DbSet<SowWeek> SowWeeks => Set<SowWeek>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamQuestion> ExamQuestions => Set<ExamQuestion>();
    public DbSet<StudentAnswer> StudentAnswers => Set<StudentAnswer>();
    public DbSet<StudentExamResult> StudentExamResults => Set<StudentExamResult>();
    public DbSet<TermGrade> TermGrades => Set<TermGrade>();
    public DbSet<ReportCard> ReportCards => Set<ReportCard>();
    public DbSet<StudentAttendance> StudentAttendance => Set<StudentAttendance>();
    public DbSet<StaffAttendance> StaffAttendance => Set<StaffAttendance>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<FeeType> FeeTypes => Set<FeeType>();
    public DbSet<FeeStructureItem> FeeStructure => Set<FeeStructureItem>();
    public DbSet<FeePayment> FeePayments => Set<FeePayment>();
    public DbSet<SalaryPayment> SalaryPayments => Set<SalaryPayment>();
    public DbSet<SchoolSettings> Settings => Set<SchoolSettings>();
    public DbSet<LicenseRecord> Licenses => Set<LicenseRecord>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Student>(e =>
        {
            e.HasIndex(s => s.IndexNumber).IsUnique();
            e.HasOne(s => s.CurrentClass)
                .WithMany(c => c.Students)
                .HasForeignKey(s => s.CurrentClassId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Username).IsUnique();
            e.HasOne(u => u.LinkedStudent).WithMany().HasForeignKey(u => u.LinkedStudentId);
            e.HasOne(u => u.LinkedStaff).WithMany().HasForeignKey(u => u.LinkedStaffId);
        });

        modelBuilder.Entity<StaffMember>(e => e.HasIndex(s => s.StaffNumber).IsUnique());
        modelBuilder.Entity<Subject>(e => e.HasIndex(s => s.Code).IsUnique());

        modelBuilder.Entity<SchoolClass>(e =>
        {
            e.HasOne(c => c.ClassTeacher).WithMany().HasForeignKey(c => c.ClassTeacherId);
        });

        modelBuilder.Entity<Term>(e =>
        {
            e.HasOne(t => t.AcademicYear).WithMany(y => y.Terms).HasForeignKey(t => t.AcademicYearId);
            e.HasIndex(t => new { t.AcademicYearId, t.Number }).IsUnique();
        });

        modelBuilder.Entity<TeachingAssignment>(e =>
            e.HasIndex(a => new { a.StaffId, a.ClassId, a.SubjectId, a.AcademicYearId }).IsUnique());

        modelBuilder.Entity<SchemeOfWork>(e =>
        {
            e.HasMany(s => s.Weeks).WithOne(w => w.SchemeOfWork).HasForeignKey(w => w.SchemeOfWorkId);
            e.HasIndex(s => new { s.StaffId, s.SubjectId, s.ClassId, s.TermId }).IsUnique();
        });

        modelBuilder.Entity<Exam>(e =>
        {
            e.HasMany(x => x.Questions).WithOne(q => q.Exam).HasForeignKey(q => q.ExamId);
        });

        modelBuilder.Entity<ExamQuestion>(e =>
            e.HasIndex(q => new { q.ExamId, q.QuestionId }).IsUnique());

        modelBuilder.Entity<StudentAnswer>(e =>
            e.HasIndex(a => new { a.ExamQuestionId, a.StudentId }).IsUnique());

        modelBuilder.Entity<StudentExamResult>(e =>
            e.HasIndex(r => new { r.ExamId, r.StudentId }).IsUnique());

        modelBuilder.Entity<TermGrade>(e =>
            e.HasIndex(g => new { g.StudentId, g.SubjectId, g.TermId }).IsUnique());

        modelBuilder.Entity<ReportCard>(e =>
            e.HasIndex(r => new { r.StudentId, r.TermId }).IsUnique());

        modelBuilder.Entity<StudentAttendance>(e =>
            e.HasIndex(a => new { a.StudentId, a.Date }).IsUnique());

        modelBuilder.Entity<StaffAttendance>(e =>
            e.HasIndex(a => new { a.StaffId, a.Date }).IsUnique());

        modelBuilder.Entity<FeeStructureItem>(e =>
            e.HasIndex(f => new { f.FeeTypeId, f.Level, f.TermId }).IsUnique());

        modelBuilder.Entity<FeePayment>(e =>
            e.HasIndex(p => p.ReceiptNumber).IsUnique());
    }
}
