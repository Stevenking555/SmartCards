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
    public DateTime LastFlipAt { get; set; }
    public string WeeklyActivityJson { get; set; } = "[]";

    public IEnumerable<LastPlayedDeckDto> LastPlayedDecks { get; set; } = new List<LastPlayedDeckDto>();
}

public class LastPlayedDeckDto
{
    public Guid DeckId { get; set; }
    public string Title { get; set; } = null!;
    public DateTime LastPlayedAt { get; set; }
}