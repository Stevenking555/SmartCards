using System;
using System.Collections.Generic;

namespace API.DTOs;

public class UserStatsDto
{
    public long FlippedCardsTotal { get; set; }
    public int FlippedCardsToday { get; set; }
    public int LearningStreak { get; set; }
    public int TotalDecks { get; set; }
    public long TotalCards { get; set; }
    public long TotalMasteredCards { get; set; }
    public string WeeklyActivityJson { get; set; } = "[]";
}