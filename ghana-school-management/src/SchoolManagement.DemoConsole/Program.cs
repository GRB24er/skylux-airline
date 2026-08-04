// Cross-platform demo of the Ghana School Management System core:
// seeds a demo school, enrolls JHS students, generates a BECE-style exam
// from the question bank, auto-marks it, records fees and prints a report card.
// The WinUI 3 desktop app drives these same services from its ViewModels.

using System.Text.Json;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;
using SchoolManagement.Core.Exams;
using SchoolManagement.Core.Licensing;
using SchoolManagement.Data;
using SchoolManagement.Services;

var connection = new SqliteConnection("DataSource=:memory:");
connection.Open();
var options = new DbContextOptionsBuilder<SchoolDbContext>().UseSqlite(connection).Options;
await using var db = new SchoolDbContext(options);

Console.WriteLine("== Ghana Basic School Management System — demo ==\n");

// 1. Licensing: fingerprint this machine and run the trial/activation flow.
var fingerprint = HardwareFingerprint.Compute(new DefaultHardwareInfoProvider());
var licensing = new LicenseManager("demo-vendor-secret");
var key = LicenseManager.GenerateLicenseKey();
var licenseFile = licensing.Activate(key, "Demo Academy, Accra", fingerprint, DateTime.UtcNow.AddYears(1));
Console.WriteLine($"License key      : {key}");
Console.WriteLine($"Hardware print   : {fingerprint[..16]}…");
Console.WriteLine($"License status   : {licensing.Validate(licenseFile, fingerprint, DateTime.UtcNow)}");
Console.WriteLine($"On another PC    : {licensing.Validate(licenseFile, "DIFFERENT-FINGERPRINT", DateTime.UtcNow)}\n");

// 2. Seed the school: GES subjects, KG-JHS3 classes, three-term calendar, admin user.
await SeedData.InitializeAsync(db);
Console.WriteLine($"Seeded {await db.Subjects.CountAsync()} GES subjects, {await db.Classes.CountAsync()} classes, {await db.Terms.CountAsync()} terms.\n");

var jhs2 = await db.Classes.FirstAsync(c => c.Level == ClassLevel.JHS2);
var math = await db.Subjects.FirstAsync(s => s.Code == "MATH");
var term = await db.Terms.FirstAsync(t => t.IsCurrent);

// 3. Enroll students.
var studentService = new StudentService(db);
var ama = await studentService.EnrollAsync(NewStudent("Ama", "Mensah"), jhs2.Id);
var kojo = await studentService.EnrollAsync(NewStudent("Kojo", "Asante"), jhs2.Id);
Console.WriteLine($"Enrolled {ama.FullName} ({ama.IndexNumber}) and {kojo.FullName} ({kojo.IndexNumber}) into {jhs2.Name}.\n");

// 4. Build a question bank and auto-generate an exam (4 MCQ / 1 structured / 1 essay demo blueprint).
foreach (var difficulty in new[] { DifficultyLevel.Easy, DifficultyLevel.Medium, DifficultyLevel.Hard })
{
    for (var i = 1; i <= 4; i++)
        db.Questions.Add(new Question
        {
            SubjectId = math.Id, Level = ClassLevel.JHS2, Type = QuestionType.MultipleChoice,
            Difficulty = difficulty, Text = $"({difficulty}) Simplify expression #{i}", Marks = 1,
            OptionsJson = JsonSerializer.Serialize(new[] { "x + 2", "2x", "x²", "2x + 1" }),
            CorrectOptionIndex = 1
        });
    db.Questions.Add(new Question
    {
        SubjectId = math.Id, Level = ClassLevel.JHS2, Type = QuestionType.Structured,
        Difficulty = difficulty, Text = $"({difficulty}) Solve the simultaneous equations…", Marks = 6,
        ModelAnswer = "x = 3, y = 2 with elimination steps", Rubric = "2 marks per correct step"
    });
    db.Questions.Add(new Question
    {
        SubjectId = math.Id, Level = ClassLevel.JHS2, Type = QuestionType.Essay,
        Difficulty = difficulty, Text = $"({difficulty}) A trader buys 5 crates…", Marks = 10,
        ModelAnswer = "Profit = GHS 45", Rubric = "Method 6, accuracy 4"
    });
}
await db.SaveChangesAsync();

var examService = new ExamService(db, new ExamGenerator(seed: 2026));
var exam = await examService.GenerateExamAsync(math.Id, jhs2.Id, term.Id, ExamType.EndOfTerm, new ExamBlueprint(4, 1, 1));
await examService.ApproveExamAsync(exam.Id);
Console.WriteLine($"Auto-generated exam: {exam.Title}");
Console.WriteLine($"  {exam.Questions.Count} questions, {exam.TotalMarks} marks, {exam.DurationMinutes} minutes.\n");

// 5. Ama sits the exam — answers all MCQs correctly.
var examQuestions = await db.ExamQuestions.Include(q => q.Question)
    .Where(q => q.ExamId == exam.Id).OrderBy(q => q.OrderIndex).ToListAsync();
var answers = examQuestions.Select(eq => eq.Question!.Type == QuestionType.MultipleChoice
    ? new StudentAnswer { ExamQuestionId = eq.Id, SelectedOptionIndex = 1 }
    : new StudentAnswer { ExamQuestionId = eq.Id, AnswerText = "Worked solution…" }).ToList();
await examService.SubmitAnswersAsync(exam.Id, ama.Id, answers);

var objective = await examService.AutoMarkObjectivesAsync(exam.Id, ama.Id);
Console.WriteLine($"Auto-marked objectives: {objective}/4");

foreach (var answer in await db.StudentAnswers
    .Include(a => a.ExamQuestion!).ThenInclude(q => q.Question)
    .Where(a => a.StudentId == ama.Id && !a.IsAutoMarked).ToListAsync())
{
    var awarded = answer.ExamQuestion!.Question!.Type == QuestionType.Structured ? 5m : 9m;
    await examService.MarkSubjectiveAnswerAsync(answer.Id, awarded, markedByStaffId: 1, "Clear working");
}
var result = await examService.FinalizeResultAsync(exam.Id, ama.Id);
Console.WriteLine($"Final: {result.TotalScore}/{exam.TotalMarks} = {result.Percentage}% → BECE Grade {result.BeceGrade}\n");

// 6. Term grades + report card (CA 40% / exam 60%).
var gradeService = new GradeService(db);
await gradeService.RecordTermGradeAsync(ama.Id, math.Id, term.Id, caScore: 85, examScore: result.Percentage);
await gradeService.RecordTermGradeAsync(kojo.Id, math.Id, term.Id, caScore: 70, examScore: 62);

var attendanceService = new AttendanceService(db);
await attendanceService.MarkClassAsync(jhs2.Id, new DateOnly(2025, 9, 10),
    new Dictionary<int, AttendanceStatus> { [ama.Id] = AttendanceStatus.Present, [kojo.Id] = AttendanceStatus.Late });

var reportCards = new ReportCardService(db, gradeService, attendanceService);
await reportCards.GenerateForClassAsync(jhs2.Id, term.Id);
Console.WriteLine(await reportCards.RenderTextAsync(ama.Id, term.Id));

// 7. Fees in GHS.
var tuition = await db.FeeTypes.FirstAsync(f => f.Name == "Tuition");
db.FeeStructure.Add(new FeeStructureItem { FeeTypeId = tuition.Id, Level = ClassLevel.JHS2, TermId = term.Id, AmountGhs = 1200m });
await db.SaveChangesAsync();

var feeService = new FeeService(db);
var payment = await feeService.RecordPaymentAsync(ama.Id, term.Id, 800m, PaymentMethod.MobileMoney);
var balance = await feeService.GetBalanceAsync(ama.Id, term.Id);
Console.WriteLine($"Fees: expected GHS {balance.ExpectedGhs}, paid GHS {balance.PaidGhs} (receipt {payment.ReceiptNumber}), outstanding GHS {balance.OutstandingGhs}");

static Student NewStudent(string first, string last) => new()
{
    FirstName = first,
    LastName = last,
    DateOfBirth = new DateOnly(2012, 5, 14),
    Gender = "F",
    GuardianName = "Guardian",
    GuardianPhone = "0244000000",
    EnrollmentDate = new DateOnly(2025, 9, 9)
};
