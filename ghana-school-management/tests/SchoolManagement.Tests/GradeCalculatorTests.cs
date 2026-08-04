using SchoolManagement.Core.Domain;
using SchoolManagement.Core.Grading;
using Xunit;

namespace SchoolManagement.Tests;

public class GradeCalculatorTests
{
    [Theory]
    [InlineData(100, 1)]
    [InlineData(90, 1)]
    [InlineData(89.99, 2)]
    [InlineData(80, 2)]
    [InlineData(79.99, 3)]
    [InlineData(70, 3)]
    [InlineData(60, 4)]
    [InlineData(59.99, 5)]
    [InlineData(55, 5)]
    [InlineData(50, 6)]
    [InlineData(49.99, 7)]
    [InlineData(40, 7)]
    [InlineData(35, 8)]
    [InlineData(34.99, 9)]
    [InlineData(0, 9)]
    public void BeceGrade_matches_official_bands(decimal percentage, int expected)
    {
        Assert.Equal(expected, GradeCalculator.ToBeceGrade(percentage));
    }

    [Theory]
    [InlineData(85, "A")]
    [InlineData(80, "A")]
    [InlineData(79.9, "B")]
    [InlineData(65, "C")]
    [InlineData(55, "D")]
    [InlineData(45, "E")]
    [InlineData(39.9, "F")]
    public void PrimaryLetterGrade_matches_bands(decimal percentage, string expected)
    {
        Assert.Equal(expected, GradeCalculator.ToPrimaryLetterGrade(percentage));
    }

    [Fact]
    public void FinalScore_uses_40_60_weighting_by_default()
    {
        // CA 80 x 0.4 + exam 70 x 0.6 = 32 + 42 = 74
        Assert.Equal(74m, GradeCalculator.ComputeFinalScore(80, 70));
    }

    [Fact]
    public void FinalScore_rejects_weights_that_do_not_sum_to_one()
    {
        Assert.Throws<ArgumentException>(() => GradeCalculator.ComputeFinalScore(80, 70, 0.5m, 0.6m));
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public void FinalScore_rejects_out_of_range_scores(decimal bad)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => GradeCalculator.ComputeFinalScore(bad, 50));
        Assert.Throws<ArgumentOutOfRangeException>(() => GradeCalculator.ComputeFinalScore(50, bad));
    }

    [Fact]
    public void Grade_uses_bece_scale_for_jhs_and_letters_for_primary()
    {
        var jhs = GradeCalculator.Grade(92, ClassLevel.JHS2);
        Assert.Equal("Grade 1", jhs.Label);
        Assert.Equal(1, jhs.BeceGrade);

        var primary = GradeCalculator.Grade(92, ClassLevel.Primary4);
        Assert.Equal("A", primary.Label);
        Assert.Null(primary.BeceGrade);
    }

    [Fact]
    public void RankPositions_shares_position_on_ties()
    {
        var scores = new Dictionary<string, decimal>
        {
            ["ama"] = 90, ["kojo"] = 85, ["esi"] = 85, ["yaw"] = 70
        };
        var positions = GradeCalculator.RankPositions(scores);

        Assert.Equal(1, positions["ama"]);
        Assert.Equal(2, positions["kojo"]);
        Assert.Equal(2, positions["esi"]);
        Assert.Equal(4, positions["yaw"]);
    }
}
