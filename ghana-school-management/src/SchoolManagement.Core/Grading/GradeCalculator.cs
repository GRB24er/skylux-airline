using SchoolManagement.Core.Domain;

namespace SchoolManagement.Core.Grading;

/// <summary>The result of grading a percentage score on the appropriate Ghanaian scale.</summary>
public record GradeResult(string Label, string Remark, int? BeceGrade);

/// <summary>
/// Implements Ghana basic-school grading:
/// final score = CA x caWeight + exam x examWeight (default 40/60),
/// converted to the BECE 9-point scale for JHS or a letter scale for KG/Primary.
/// </summary>
public static class GradeCalculator
{
    public const decimal DefaultCaWeight = 0.40m;
    public const decimal DefaultExamWeight = 0.60m;

    /// <summary>Weighted final score out of 100. Both inputs are out of 100.</summary>
    public static decimal ComputeFinalScore(
        decimal caScore, decimal examScore,
        decimal caWeight = DefaultCaWeight, decimal examWeight = DefaultExamWeight)
    {
        if (caScore is < 0 or > 100) throw new ArgumentOutOfRangeException(nameof(caScore), "CA score must be 0-100.");
        if (examScore is < 0 or > 100) throw new ArgumentOutOfRangeException(nameof(examScore), "Exam score must be 0-100.");
        if (caWeight < 0 || examWeight < 0 || caWeight + examWeight != 1.0m)
            throw new ArgumentException("CA and exam weights must be non-negative and sum to 1.0.");

        return Math.Round(caScore * caWeight + examScore * examWeight, 2, MidpointRounding.AwayFromZero);
    }

    /// <summary>
    /// BECE 9-point scale: Grade 1 (90-100) down to Grade 9 (0-34).
    /// </summary>
    public static int ToBeceGrade(decimal percentage) => percentage switch
    {
        < 0 or > 100 => throw new ArgumentOutOfRangeException(nameof(percentage)),
        >= 90 => 1,
        >= 80 => 2,
        >= 70 => 3,
        >= 60 => 4,
        >= 55 => 5,
        >= 50 => 6,
        >= 40 => 7,
        >= 35 => 8,
        _ => 9
    };

    public static string BeceRemark(int beceGrade) => beceGrade switch
    {
        1 => "Excellent",
        2 => "Very Good",
        3 => "Good",
        4 => "Credit",
        5 => "Credit",
        6 => "Credit",
        7 => "Pass",
        8 => "Pass",
        9 => "Fail",
        _ => throw new ArgumentOutOfRangeException(nameof(beceGrade))
    };

    /// <summary>Letter scale used for KG and Primary classes.</summary>
    public static string ToPrimaryLetterGrade(decimal percentage) => percentage switch
    {
        < 0 or > 100 => throw new ArgumentOutOfRangeException(nameof(percentage)),
        >= 80 => "A",
        >= 70 => "B",
        >= 60 => "C",
        >= 50 => "D",
        >= 40 => "E",
        _ => "F"
    };

    public static string PrimaryRemark(string letter) => letter switch
    {
        "A" => "Excellent",
        "B" => "Very Good",
        "C" => "Good",
        "D" => "Credit",
        "E" => "Pass",
        "F" => "Fail",
        _ => throw new ArgumentOutOfRangeException(nameof(letter))
    };

    /// <summary>Grade a percentage on the scale appropriate to the class level.</summary>
    public static GradeResult Grade(decimal percentage, ClassLevel level)
    {
        if (IsJhs(level))
        {
            var bece = ToBeceGrade(percentage);
            return new GradeResult($"Grade {bece}", BeceRemark(bece), bece);
        }

        var letter = ToPrimaryLetterGrade(percentage);
        return new GradeResult(letter, PrimaryRemark(letter), null);
    }

    public static bool IsJhs(ClassLevel level) =>
        level is ClassLevel.JHS1 or ClassLevel.JHS2 or ClassLevel.JHS3;

    /// <summary>
    /// Assign 1-based class positions from scores, sharing positions on ties
    /// (standard competition ranking: 1, 2, 2, 4).
    /// </summary>
    public static IReadOnlyDictionary<TKey, int> RankPositions<TKey>(IReadOnlyDictionary<TKey, decimal> scores)
        where TKey : notnull
    {
        var ordered = scores.OrderByDescending(kv => kv.Value).ToList();
        var positions = new Dictionary<TKey, int>();
        for (var i = 0; i < ordered.Count; i++)
        {
            positions[ordered[i].Key] =
                i > 0 && ordered[i].Value == ordered[i - 1].Value
                    ? positions[ordered[i - 1].Key]
                    : i + 1;
        }
        return positions;
    }
}
