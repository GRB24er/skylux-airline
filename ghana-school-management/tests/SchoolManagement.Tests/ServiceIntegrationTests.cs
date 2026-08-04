using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SchoolManagement.Core.Domain;
using SchoolManagement.Core.Exams;
using SchoolManagement.Data;
using SchoolManagement.Services;
using Xunit;

namespace SchoolManagement.Tests;

public class SeedDataTests : IDisposable
{
    private readonly TestDatabase _test = new();

    [Fact]
    public async Task Seeds_subjects_classes_terms_fees_and_admin()
    {
        await SeedData.InitializeAsync(_test.Db);

        Assert.Equal(11, await _test.Db.Subjects.CountAsync());
        Assert.Equal(11, await _test.Db.Classes.CountAsync());
        Assert.Equal(3, await _test.Db.Terms.CountAsync());
        Assert.Equal(8, await _test.Db.FeeTypes.CountAsync());
        Assert.NotNull(await _test.Db.Users.SingleAsync(u => u.Username == "admin"));
        Assert.NotNull(await _test.Db.Settings.SingleAsync());

        // Seeding twice must not duplicate.
        await SeedData.InitializeAsync(_test.Db);
        Assert.Equal(11, await _test.Db.Subjects.CountAsync());
    }

    public void Dispose() => _test.Dispose();
}

public class StudentServiceTests : IDisposable
{
    private readonly TestDatabase _test = new();

    [Fact]
    public async Task Enrollment_assigns_sequential_ges_index_numbers()
    {
        await SeedData.InitializeAsync(_test.Db);
        var service = new StudentService(_test.Db);
        var classId = (await _test.Db.Classes.FirstAsync(c => c.Level == ClassLevel.Primary1)).Id;

        var first = await service.EnrollAsync(NewStudent("Ama", "Mensah"), classId);
        var second = await service.EnrollAsync(NewStudent("Kojo", "Asante"), classId);

        Assert.Equal("GES-2025-0001", first.IndexNumber);
        Assert.Equal("GES-2025-0002", second.IndexNumber);
        Assert.Equal(classId, first.CurrentClassId);
    }

    [Fact]
    public async Task Promotion_moves_students_up_and_graduates_jhs3()
    {
        await SeedData.InitializeAsync(_test.Db);
        var service = new StudentService(_test.Db);
        var p1 = await _test.Db.Classes.FirstAsync(c => c.Level == ClassLevel.Primary1);
        var p2 = await _test.Db.Classes.FirstAsync(c => c.Level == ClassLevel.Primary2);
        var jhs3 = await _test.Db.Classes.FirstAsync(c => c.Level == ClassLevel.JHS3);

        var promotee = await service.EnrollAsync(NewStudent("Ama", "Mensah"), p1.Id);
        var repeater = await service.EnrollAsync(NewStudent("Yaw", "Owusu"), p1.Id);
        var finalist = await service.EnrollAsync(NewStudent("Esi", "Boateng"), jhs3.Id);

        var (promoted, retained, _) = await service.PromoteClassAsync(p1.Id, new HashSet<int> { repeater.Id });
        Assert.Equal(1, promoted);
        Assert.Equal(1, retained);

        var (_, _, graduated) = await service.PromoteClassAsync(jhs3.Id);
        Assert.Equal(1, graduated);

        await _test.Db.Entry(promotee).ReloadAsync();
        await _test.Db.Entry(repeater).ReloadAsync();
        await _test.Db.Entry(finalist).ReloadAsync();
        Assert.Equal(p2.Id, promotee.CurrentClassId);
        Assert.Equal(p1.Id, repeater.CurrentClassId);
        Assert.Equal(StudentStatus.Graduated, finalist.Status);
        Assert.Null(finalist.CurrentClassId);
    }

    internal static Student NewStudent(string first, string last) => new()
    {
        FirstName = first,
        LastName = last,
        DateOfBirth = new DateOnly(2015, 1, 1),
        Gender = "F",
        GuardianName = "Guardian",
        GuardianPhone = "0200000000",
        EnrollmentDate = new DateOnly(2025, 9, 9)
    };

    public void Dispose() => _test.Dispose();
}

public class AttendanceServiceTests : IDisposable
{
    private readonly TestDatabase _test = new();

    [Fact]
    public async Task Bulk_marking_and_summary_with_late_counted_present()
    {
        await SeedData.InitializeAsync(_test.Db);
        var students = new StudentService(_test.Db);
        var attendance = new AttendanceService(_test.Db);
        var classId = (await _test.Db.Classes.FirstAsync()).Id;
        var s = await students.EnrollAsync(StudentServiceTests.NewStudent("Ama", "Mensah"), classId);

        await attendance.MarkClassAsync(classId, new DateOnly(2025, 9, 10), new Dictionary<int, AttendanceStatus> { [s.Id] = AttendanceStatus.Present });
        await attendance.MarkClassAsync(classId, new DateOnly(2025, 9, 11), new Dictionary<int, AttendanceStatus> { [s.Id] = AttendanceStatus.Late });
        await attendance.MarkClassAsync(classId, new DateOnly(2025, 9, 12), new Dictionary<int, AttendanceStatus> { [s.Id] = AttendanceStatus.Absent });
        await attendance.MarkClassAsync(classId, new DateOnly(2025, 9, 13), new Dictionary<int, AttendanceStatus> { [s.Id] = AttendanceStatus.Excused });

        var summary = await attendance.GetStudentSummaryAsync(s.Id, new DateOnly(2025, 9, 1), new DateOnly(2025, 9, 30));
        Assert.Equal(1, summary.Present);
        Assert.Equal(1, summary.Late);
        Assert.Equal(1, summary.Absent);
        Assert.Equal(1, summary.Excused);
        Assert.Equal(50.0m, summary.Percentage); // (1 present + 1 late) / 4

        // Re-marking the same day updates, not duplicates.
        await attendance.MarkClassAsync(classId, new DateOnly(2025, 9, 12), new Dictionary<int, AttendanceStatus> { [s.Id] = AttendanceStatus.Present });
        var updated = await attendance.GetStudentSummaryAsync(s.Id, new DateOnly(2025, 9, 1), new DateOnly(2025, 9, 30));
        Assert.Equal(4, updated.TotalDays);
        Assert.Equal(2, updated.Present);
    }

    public void Dispose() => _test.Dispose();
}

public class FeeServiceTests : IDisposable
{
    private readonly TestDatabase _test = new();

    [Fact]
    public async Task Balance_receipts_and_outstanding_report()
    {
        await SeedData.InitializeAsync(_test.Db);
        var students = new StudentService(_test.Db);
        var fees = new FeeService(_test.Db);
        var p1 = await _test.Db.Classes.FirstAsync(c => c.Level == ClassLevel.Primary1);
        var term = await _test.Db.Terms.FirstAsync(t => t.IsCurrent);
        var tuition = await _test.Db.FeeTypes.FirstAsync(f => f.Name == "Tuition");
        var pta = await _test.Db.FeeTypes.FirstAsync(f => f.Name == "PTA");

        _test.Db.FeeStructure.AddRange(
            new FeeStructureItem { FeeTypeId = tuition.Id, Level = ClassLevel.Primary1, TermId = term.Id, AmountGhs = 800m },
            new FeeStructureItem { FeeTypeId = pta.Id, Level = ClassLevel.Primary1, TermId = term.Id, AmountGhs = 50m });
        await _test.Db.SaveChangesAsync();

        var ama = await students.EnrollAsync(StudentServiceTests.NewStudent("Ama", "Mensah"), p1.Id);
        var kojo = await students.EnrollAsync(StudentServiceTests.NewStudent("Kojo", "Asante"), p1.Id);

        var payment1 = await fees.RecordPaymentAsync(ama.Id, term.Id, 500m, PaymentMethod.MobileMoney);
        var payment2 = await fees.RecordPaymentAsync(kojo.Id, term.Id, 850m, PaymentMethod.Cash);

        Assert.Equal("RCT-000001", payment1.ReceiptNumber);
        Assert.Equal("RCT-000002", payment2.ReceiptNumber);

        var amaBalance = await fees.GetBalanceAsync(ama.Id, term.Id);
        Assert.Equal(850m, amaBalance.ExpectedGhs);
        Assert.Equal(350m, amaBalance.OutstandingGhs);
        Assert.False(amaBalance.FullyPaid);

        var kojoBalance = await fees.GetBalanceAsync(kojo.Id, term.Id);
        Assert.True(kojoBalance.FullyPaid);

        var outstanding = await fees.GetOutstandingAsync(term.Id);
        var row = Assert.Single(outstanding);
        Assert.Equal(ama.Id, row.StudentId);
        Assert.Equal(350m, row.OutstandingGhs);

        Assert.Equal(1350m, await fees.GetTermRevenueAsync(term.Id));
    }

    [Fact]
    public async Task Rejects_non_positive_payments()
    {
        await SeedData.InitializeAsync(_test.Db);
        var fees = new FeeService(_test.Db);
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() =>
            fees.RecordPaymentAsync(1, 1, 0m, PaymentMethod.Cash));
    }

    public void Dispose() => _test.Dispose();
}

public class ExamPipelineTests : IDisposable
{
    private readonly TestDatabase _test = new();

    /// <summary>Full pipeline: bank → generated paper → answers → auto-mark → teacher mark → graded result.</summary>
    [Fact]
    public async Task End_to_end_jhs_exam_produces_bece_graded_result()
    {
        await SeedData.InitializeAsync(_test.Db);
        var db = _test.Db;
        var students = new StudentService(db);
        var exams = new ExamService(db, new ExamGenerator(seed: 42));

        var jhs2 = await db.Classes.FirstAsync(c => c.Level == ClassLevel.JHS2);
        var math = await db.Subjects.FirstAsync(s => s.Code == "MATH");
        var term = await db.Terms.FirstAsync(t => t.IsCurrent);
        var student = await students.EnrollAsync(StudentServiceTests.NewStudent("Esi", "Boateng"), jhs2.Id);

        // Small blueprint so the test bank stays manageable: 4 MCQs, 1 structured, 1 essay.
        foreach (var difficulty in new[] { DifficultyLevel.Easy, DifficultyLevel.Medium, DifficultyLevel.Hard })
        {
            for (var i = 0; i < 4; i++)
            {
                db.Questions.Add(new Question
                {
                    SubjectId = math.Id, Level = ClassLevel.JHS2, Type = QuestionType.MultipleChoice,
                    Difficulty = difficulty, Text = $"MCQ {difficulty} {i}", Marks = 1,
                    OptionsJson = JsonSerializer.Serialize(new[] { "1", "2", "3", "4" }),
                    CorrectOptionIndex = 0
                });
            }
            db.Questions.Add(new Question
            {
                SubjectId = math.Id, Level = ClassLevel.JHS2, Type = QuestionType.Structured,
                Difficulty = difficulty, Text = $"Structured {difficulty}", Marks = 6,
                ModelAnswer = "Model answer", Rubric = "2 marks per step"
            });
            db.Questions.Add(new Question
            {
                SubjectId = math.Id, Level = ClassLevel.JHS2, Type = QuestionType.Essay,
                Difficulty = difficulty, Text = $"Essay {difficulty}", Marks = 10,
                ModelAnswer = "Essay model", Rubric = "Content 6, structure 4"
            });
        }
        await db.SaveChangesAsync();

        var exam = await exams.GenerateExamAsync(
            math.Id, jhs2.Id, term.Id, ExamType.EndOfTerm,
            new ExamBlueprint(4, 1, 1), durationMinutes: 120);

        Assert.Equal(4 + 6 + 10, exam.TotalMarks);
        await exams.ApproveExamAsync(exam.Id);

        // Student answers: 3 of 4 MCQs correct.
        var examQuestions = await db.ExamQuestions
            .Include(q => q.Question)
            .Where(q => q.ExamId == exam.Id)
            .OrderBy(q => q.OrderIndex)
            .ToListAsync();

        var answers = new List<StudentAnswer>();
        var mcqSeen = 0;
        foreach (var eq in examQuestions)
        {
            if (eq.Question!.Type == QuestionType.MultipleChoice)
            {
                mcqSeen++;
                answers.Add(new StudentAnswer
                {
                    ExamQuestionId = eq.Id,
                    SelectedOptionIndex = mcqSeen <= 3 ? 0 : 2
                });
            }
            else
            {
                answers.Add(new StudentAnswer { ExamQuestionId = eq.Id, AnswerText = "written answer" });
            }
        }
        await exams.SubmitAnswersAsync(exam.Id, student.Id, answers);

        var objective = await exams.AutoMarkObjectivesAsync(exam.Id, student.Id);
        Assert.Equal(3m, objective);

        // Teacher marks the two subjective answers.
        var subjectiveAnswers = await db.StudentAnswers
            .Include(a => a.ExamQuestion!).ThenInclude(q => q.Question)
            .Where(a => a.StudentId == student.Id && !a.IsAutoMarked)
            .ToListAsync();
        Assert.Equal(2, subjectiveAnswers.Count);

        foreach (var answer in subjectiveAnswers)
        {
            var marks = answer.ExamQuestion!.Question!.Type == QuestionType.Structured ? 5m : 8m;
            await exams.MarkSubjectiveAnswerAsync(answer.Id, marks, markedByStaffId: 1, "Good work");
        }

        var result = await exams.FinalizeResultAsync(exam.Id, student.Id);
        Assert.Equal(3m, result.ObjectiveScore);
        Assert.Equal(13m, result.SubjectiveScore);
        Assert.Equal(16m, result.TotalScore);
        Assert.Equal(80m, result.Percentage); // 16/20
        Assert.Equal(2, result.BeceGrade);    // 80% => BECE Grade 2
        Assert.Null(result.LetterGrade);

        // Marking scheme includes the MCQ answer key.
        var scheme = await exams.GetMarkingSchemeTextAsync(exam.Id);
        Assert.Contains("MARKING SCHEME", scheme);
        Assert.Contains("Answer: A. 1", scheme);
    }

    [Fact]
    public async Task Teachers_cannot_hand_mark_mcqs()
    {
        await SeedData.InitializeAsync(_test.Db);
        var db = _test.Db;
        var jhs2 = await db.Classes.FirstAsync(c => c.Level == ClassLevel.JHS2);
        var math = await db.Subjects.FirstAsync(s => s.Code == "MATH");
        var term = await db.Terms.FirstAsync(t => t.IsCurrent);
        var student = await new StudentService(db).EnrollAsync(StudentServiceTests.NewStudent("Yaw", "Owusu"), jhs2.Id);

        var question = new Question
        {
            SubjectId = math.Id, Level = ClassLevel.JHS2, Type = QuestionType.MultipleChoice,
            Difficulty = DifficultyLevel.Medium, Text = "Q", Marks = 1,
            OptionsJson = JsonSerializer.Serialize(new[] { "a", "b" }), CorrectOptionIndex = 0
        };
        db.Questions.Add(question);
        await db.SaveChangesAsync();

        var exams = new ExamService(db, new ExamGenerator(seed: 1));
        var exam = await exams.GenerateExamAsync(math.Id, jhs2.Id, term.Id, ExamType.MidTerm, new ExamBlueprint(1, 0, 0));
        var eq = await db.ExamQuestions.FirstAsync(q => q.ExamId == exam.Id);

        var answer = new StudentAnswer { ExamQuestionId = eq.Id, StudentId = student.Id, SelectedOptionIndex = 0 };
        db.StudentAnswers.Add(answer);
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            exams.MarkSubjectiveAnswerAsync(answer.Id, 1m, markedByStaffId: 1));
    }

    public void Dispose() => _test.Dispose();
}

public class GradeAndReportCardTests : IDisposable
{
    private readonly TestDatabase _test = new();

    [Fact]
    public async Task Term_grades_positions_and_report_cards()
    {
        await SeedData.InitializeAsync(_test.Db);
        var db = _test.Db;
        var students = new StudentService(db);
        var grades = new GradeService(db);
        var attendance = new AttendanceService(db);
        var reportCards = new ReportCardService(db, grades, attendance);

        var p4 = await db.Classes.FirstAsync(c => c.Level == ClassLevel.Primary4);
        var term = await db.Terms.FirstAsync(t => t.IsCurrent);
        var english = await db.Subjects.FirstAsync(s => s.Code == "ENG");
        var math = await db.Subjects.FirstAsync(s => s.Code == "MATH");

        var ama = await students.EnrollAsync(StudentServiceTests.NewStudent("Ama", "Mensah"), p4.Id);
        var kojo = await students.EnrollAsync(StudentServiceTests.NewStudent("Kojo", "Asante"), p4.Id);

        // Ama: ENG 80/90 -> 86, MATH 70/80 -> 76  => avg 81
        await grades.RecordTermGradeAsync(ama.Id, english.Id, term.Id, 80, 90);
        await grades.RecordTermGradeAsync(ama.Id, math.Id, term.Id, 70, 80);
        // Kojo: ENG 60/50 -> 54, MATH 90/85 -> 87  => avg 70.5
        await grades.RecordTermGradeAsync(kojo.Id, english.Id, term.Id, 60, 50);
        await grades.RecordTermGradeAsync(kojo.Id, math.Id, term.Id, 90, 85);

        var amaEnglish = await db.TermGrades.FirstAsync(g => g.StudentId == ama.Id && g.SubjectId == english.Id);
        Assert.Equal(86m, amaEnglish.FinalScore);
        Assert.Equal("A", amaEnglish.GradeLabel); // Primary scale

        var standings = await grades.ComputeClassStandingsAsync(p4.Id, term.Id);
        Assert.Equal(ama.Id, standings[0].StudentId);
        Assert.Equal(1, standings[0].Position);
        Assert.Equal(81m, standings[0].Average);
        Assert.Equal(2, standings[1].Position);

        // Per-subject positions: Kojo is 1st in math.
        var kojoMath = await db.TermGrades.FirstAsync(g => g.StudentId == kojo.Id && g.SubjectId == math.Id);
        Assert.Equal(1, kojoMath.SubjectPosition);

        var cards = await reportCards.GenerateForClassAsync(p4.Id, term.Id);
        Assert.Equal(2, cards.Count);
        var amaCard = cards.Single(c => c.StudentId == ama.Id);
        Assert.Equal(1, amaCard.ClassPosition);
        Assert.Equal(2, amaCard.ClassSize);

        var text = await reportCards.RenderTextAsync(ama.Id, term.Id);
        Assert.Contains("Ama Mensah", text);
        Assert.Contains("Position: 1 out of 2", text);
        Assert.Contains("English Language", text);
    }

    public void Dispose() => _test.Dispose();
}

public class SowWorkflowTests : IDisposable
{
    private readonly TestDatabase _test = new();

    [Fact]
    public async Task Draft_submit_approve_lifecycle()
    {
        await SeedData.InitializeAsync(_test.Db);
        var db = _test.Db;
        db.Staff.Add(new StaffMember { StaffNumber = "ST-001", FirstName = "Kofi", LastName = "Adjei", Role = StaffRole.SubjectTeacher, Phone = "020", HireDate = new DateOnly(2024, 9, 1) });
        db.Staff.Add(new StaffMember { StaffNumber = "ST-002", FirstName = "Abena", LastName = "Sarpong", Role = StaffRole.Headteacher, Phone = "024", HireDate = new DateOnly(2020, 9, 1) });
        await db.SaveChangesAsync();
        var teacher = await db.Staff.FirstAsync(s => s.StaffNumber == "ST-001");
        var head = await db.Staff.FirstAsync(s => s.StaffNumber == "ST-002");
        var p1 = await db.Classes.FirstAsync(c => c.Level == ClassLevel.Primary1);
        var math = await db.Subjects.FirstAsync(s => s.Code == "MATH");
        var term = await db.Terms.FirstAsync(t => t.IsCurrent);

        var sows = new SchemeOfWorkService(db);
        var sow = await sows.CreateDraftAsync(teacher.Id, math.Id, p1.Id, term.Id);
        Assert.Equal(12, sow.Weeks.Count);

        // Empty SOW cannot be submitted.
        await Assert.ThrowsAsync<InvalidOperationException>(() => sows.SubmitAsync(sow.Id));

        sow.Weeks[0].Topic = "Counting to 100";
        sow.Weeks[0].IsCompleted = true;
        sow.Weeks[1].Topic = "Addition";
        await db.SaveChangesAsync();

        await sows.SubmitAsync(sow.Id);
        await sows.ReviewAsync(sow.Id, head.Id, approve: true, "Well structured");

        await db.Entry(sow).ReloadAsync();
        Assert.Equal(SowStatus.Approved, sow.Status);
        Assert.Equal(head.Id, sow.ReviewedByStaffId);

        Assert.Equal(0.08m, await sows.GetProgressAsync(sow.Id)); // 1/12 weeks

        // Duplicate SOW for the same subject/class/term is rejected.
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            sows.CreateDraftAsync(teacher.Id, math.Id, p1.Id, term.Id));
    }

    public void Dispose() => _test.Dispose();
}

public class AuthServiceTests : IDisposable
{
    private readonly TestDatabase _test = new();

    [Fact]
    public async Task Login_succeeds_with_seeded_admin_and_fails_with_wrong_password()
    {
        await SeedData.InitializeAsync(_test.Db, adminPassword: "Admin#2025");
        var auth = new AuthService(_test.Db);

        var ok = await auth.LoginAsync("admin", "Admin#2025");
        Assert.True(ok.Success);
        Assert.Equal(UserRole.Admin, ok.User!.Role);

        var bad = await auth.LoginAsync("admin", "wrong");
        Assert.False(bad.Success);

        // Both attempts audited.
        Assert.True(await _test.Db.AuditLogs.CountAsync(l => l.Action == "LOGIN") == 1);
        Assert.True(await _test.Db.AuditLogs.CountAsync(l => l.Action == "LOGIN_FAILED") == 1);
    }

    [Fact]
    public async Task Disabled_accounts_cannot_log_in()
    {
        await SeedData.InitializeAsync(_test.Db);
        var auth = new AuthService(_test.Db);
        var user = await auth.CreateUserAsync("kofi", "Pass#1234", UserRole.Teacher, "Kofi Adjei");
        await _test.Db.SaveChangesAsync();

        user.IsActive = false;
        await _test.Db.SaveChangesAsync();

        var result = await auth.LoginAsync("kofi", "Pass#1234");
        Assert.False(result.Success);
        Assert.Contains("disabled", result.Error);
    }

    [Fact]
    public void Role_permissions_match_the_specification()
    {
        // Teachers grade and mark attendance; owners and heads do not.
        Assert.True(Permissions.Can(UserRole.Teacher, Permissions.Action.EnterGrades));
        Assert.False(Permissions.Can(UserRole.Owner, Permissions.Action.EnterGrades));
        Assert.False(Permissions.Can(UserRole.Headteacher, Permissions.Action.EnterGrades));

        // Only the accountant records payments; heads don't see transactions.
        Assert.True(Permissions.Can(UserRole.Accountant, Permissions.Action.RecordFeePayment));
        Assert.False(Permissions.Can(UserRole.Headteacher, Permissions.Action.RecordFeePayment));

        // Head approves SOW; teachers cannot.
        Assert.True(Permissions.Can(UserRole.Headteacher, Permissions.Action.ApproveSchemeOfWork));
        Assert.False(Permissions.Can(UserRole.Teacher, Permissions.Action.ApproveSchemeOfWork));

        // Accountant cannot see grades-related functions; admin cannot see finance.
        Assert.False(Permissions.Can(UserRole.Accountant, Permissions.Action.EnterGrades));
        Assert.False(Permissions.Can(UserRole.Admin, Permissions.Action.ViewAllFinance));

        // Parents/students see only their own data.
        Assert.True(Permissions.Can(UserRole.Parent, Permissions.Action.ViewOwnChildOnly));
        Assert.False(Permissions.Can(UserRole.Parent, Permissions.Action.ViewAllStudents));
    }

    public void Dispose() => _test.Dispose();
}
