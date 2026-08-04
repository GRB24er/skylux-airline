# Database Schema

SQLite via Entity Framework Core (`SchoolDbContext`). All tables are created by
`Database.EnsureCreated()`; swap to EF migrations before shipping schema changes
to installed schools.

## People & access

| Table | Purpose | Key constraints |
|---|---|---|
| `Students` | Pupil records, guardian contacts, status, current class | unique `IndexNumber`; FK → `Classes` (SetNull on delete) |
| `Staff` | Teaching and non-teaching staff, role, salary | unique `StaffNumber` |
| `Users` | Login accounts for all 7 roles | unique `Username`; optional FKs → `Students` (student/parent portal), `Staff` |

## Academic structure

| Table | Purpose | Key constraints |
|---|---|---|
| `Classes` | KG 1 → JHS 3 ladder, capacity, class teacher | FK → `Staff` |
| `Subjects` | GES curriculum subjects | unique `Code` |
| `AcademicYears` / `Terms` | 3-term Ghanaian calendar | unique (`AcademicYearId`, `Number`) |
| `TeachingAssignments` | Teacher ↔ class ↔ subject per year | unique (`StaffId`, `ClassId`, `SubjectId`, `AcademicYearId`) |
| `SchemesOfWork` / `SowWeeks` | SOW approval workflow + weekly plans | unique (`StaffId`, `SubjectId`, `ClassId`, `TermId`) |
| `Announcements` | Portal announcements, optional audience role | — |

## Assessment

| Table | Purpose | Key constraints |
|---|---|---|
| `Questions` | Question bank: subject, level, topic, type, difficulty, marks, MCQ options/answer, rubric, usage count | — |
| `Exams` / `ExamQuestions` | Generated papers | unique (`ExamId`, `QuestionId`) — no duplicates on a paper |
| `StudentAnswers` | Per-question answers, auto/teacher marks | unique (`ExamQuestionId`, `StudentId`) |
| `StudentExamResults` | Objective + subjective + total, BECE/letter grade | unique (`ExamId`, `StudentId`) |
| `TermGrades` | CA + exam + weighted final per subject/term, subject position | unique (`StudentId`, `SubjectId`, `TermId`) |
| `ReportCards` | Aggregated term result, class position, attendance, promotion | unique (`StudentId`, `TermId`) |

## Attendance

| Table | Purpose | Key constraints |
|---|---|---|
| `StudentAttendance` | Daily status per student | unique (`StudentId`, `Date`) — re-marking updates |
| `StaffAttendance` | Daily status per staff member | unique (`StaffId`, `Date`) |
| `LeaveRequests` | Staff leave workflow | — |

## Finance (GHS)

| Table | Purpose | Key constraints |
|---|---|---|
| `FeeTypes` | Tuition, PTA, Books, Uniforms, Feeding, Transport, Sports, Examination | — |
| `FeeStructure` | Amount per fee type / class level / term | unique (`FeeTypeId`, `Level`, `TermId`) |
| `FeePayments` | Payments with sequential receipts | unique `ReceiptNumber` |
| `SalaryPayments` | Basic payroll history | — |

## System

| Table | Purpose |
|---|---|
| `Settings` | Single row: school identity, CA/exam weights, currency, language |
| `Licenses` | Cached license record (key, hardware fingerprint, status, expiry) |
| `AuditLogs` | Immutable action trail (logins, user admin, license events) |

## SQLite notes

- `decimal` aggregates (`SUM`) are not translatable by the SQLite provider —
  services fetch values and aggregate client-side (see `FeeService`).
- `DateOnly` is supported natively by the EF Core 8 SQLite provider.
