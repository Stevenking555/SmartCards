using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("UserStats")]
public class UserStats
{
    [Key]
    [Required]
    public string AppUserId { get; set; } = null!;
    public AppUser AppUser { get; set; } = null!;

    public long FlippedCardsTotal { get; set; }
    public int FlippedCardsToday { get; set; }
    public int LearningStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime LastFlipAt { get; set; }
    
    public string WeeklyActivityJson { get; set; } = "[]";
}
