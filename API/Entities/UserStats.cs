// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
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

    public long FlippedCardsTotal { get; set; } = 0;
    public int FlippedCardsToday { get; set; } = 0;
    public int LearningStreak { get; set; } = 0;
    public int TotalDecks { get; set; } = 0;
    public long TotalCards { get; set; } = 0;
    public long TotalMasteredCards { get; set; } = 0;
    public DateTime LastFlipAt { get; set; } = DateTime.UtcNow;
    public string WeeklyActivityJson { get; set; } = "[0,0,0,0,0,0,0]";
}
