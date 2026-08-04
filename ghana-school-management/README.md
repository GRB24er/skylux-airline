# Ghana Basic School Management System

A school management system for **Ghanaian private basic schools** (KG, Primary 1–6, JHS 1–3), built in **C# / .NET 8** with **Entity Framework Core + SQLite** for offline-first storage and a **WinUI 3** desktop shell. Includes **hardware-locked licensing** with a 30-day trial.

## What is implemented

| Area | Highlights |
|---|---|
| **Grading engine** | CA 40% + end-of-term 60% weighting (configurable), **BECE 9-point scale** for JHS, letter scale (A–F) for KG/Primary, tie-aware class and subject positions |
| **Automated exams** | Exam generation from the question bank with **20/60/20 easy/medium/hard** distribution, BECE-format blueprint for JHS (40 MCQ / 10 structured / 3 essay), no duplicate questions, least-recently-used preference |
| **Marking** | Auto-generated marking schemes (MCQ answer keys + rubrics), **automatic MCQ marking**, teacher marks subjectives only (MCQ hand-marking is rejected), combined scoring and grade conversion |
| **Students** | Enrollment with sequential GES-style index numbers, class assignment, **bulk promotion** with retention lists, JHS 3 graduation |
| **Attendance** | Bulk class marking (idempotent re-marking), student + staff attendance, term summaries, percentage with Late counted as present |
| **Fees (GHS)** | Fee structure per class level/term, payments with sequential receipt numbers, balances, **outstanding-fees report**, term revenue |
| **Scheme of Work** | Draft → submit → approve / request-revision workflow, weekly plan slots, completion tracking |
| **Report cards** | One-click generation for a whole class: averages, positions, attendance, promotion status; printable text render (PDF in the WinUI app) |
| **Security** | PBKDF2-SHA256 password hashing, role-based permission map for all 7 roles, audit logging of logins and admin actions |
| **Licensing** | Hardware fingerprint (MAC + CPU + motherboard + disk, SHA-256), **AES-256-GCM encrypted license file**, tamper detection, hardware-mismatch/expiry detection, checksummed license keys, 30-day trial with clock-rollback detection |

## Solution layout

```
ghana-school-management/
├── SchoolManagement.sln
├── src/
│   ├── SchoolManagement.Core/        # Domain entities + pure business logic (no dependencies)
│   │   ├── Domain/                   #   Entities and enums (students, exams, fees, SOW…)
│   │   ├── Grading/                  #   GradeCalculator: BECE + primary scales, rankings
│   │   ├── Exams/                    #   ExamGenerator, MarkingSchemeGenerator, AutoMarker
│   │   ├── Licensing/                #   HardwareFingerprint, LicenseManager (AES-256-GCM)
│   │   └── Security/                 #   PasswordHasher (PBKDF2)
│   ├── SchoolManagement.Data/        # EF Core DbContext (SQLite) + SeedData (GES subjects, classes, terms)
│   ├── SchoolManagement.Services/    # Application services: Auth, Student, Attendance, Fee,
│   │                                 # Exam, Grade, SchemeOfWork, ReportCard, Permissions
│   ├── SchoolManagement.DemoConsole/ # Cross-platform end-to-end demo (dotnet run)
│   └── SchoolManagement.App/         # WinUI 3 desktop shell (Windows-only; not in the .sln — see below)
├── tests/SchoolManagement.Tests/     # 66 xUnit tests (unit + SQLite integration)
└── docs/                             # Database schema, licensing design
```

## Building and running

Requires the .NET 8 SDK.

```bash
cd ghana-school-management
dotnet build          # builds core, data, services, demo console, tests
dotnet test           # runs the full test suite
dotnet run --project src/SchoolManagement.DemoConsole   # end-to-end demo
```

The demo console seeds a school, activates a hardware-locked license, enrolls JHS students, auto-generates a BECE-style Mathematics exam from a question bank, auto-marks the objectives, applies teacher marks to subjectives, computes the BECE grade, prints a terminal report card, and records a GHS fee payment with a receipt.

### WinUI 3 desktop app

`src/SchoolManagement.App` targets `net8.0-windows10.0.19041.0` and needs Visual Studio 2022 on Windows (Windows App SDK workload). It is deliberately **not** in `SchoolManagement.sln` so the rest of the solution builds on any OS — add it to the solution on a Windows machine. It wires the same services via dependency injection, stores its SQLite database under `%LocalAppData%\GhanaSchoolManagement\school.db`, and uses a WMI-based hardware provider for real CPU/motherboard/disk serials.

## Roles

Seven roles with a central permission map (`Permissions` in `SchoolManagement.Services`): Owner, Headteacher, Teacher, Accountant, Admin, Parent, Student. The map enforces the separation in the specification — e.g. only teachers enter grades and mark attendance, only accountants record payments, only headteachers approve Schemes of Work, and parents/students see their own data only.

## Default admin account

Seeding creates `admin` / `ChangeMe123!` (override via `SeedData.InitializeAsync(db, adminPassword: …)`). Change it on first login.

## Roadmap (per the original phased plan)

- [x] Phase 1–3 core: schema, auth/roles, students/staff/classes, exams, grading, report cards
- [x] Phase 4 core: attendance, fees
- [x] Phase 6 core: hardware-locked licensing, encryption, audit logging
- [ ] WinUI 3 views for each module (shell + login VM scaffolded)
- [ ] PDF export (report cards, exam papers) and Excel/CSV exports
- [ ] Cloud sync (PostgreSQL) + license server verification
- [ ] Parent/student portal UI, timetables, calendar/events, payroll, notifications
- [ ] Localization (Twi, Ga, Ewe, Fante)
