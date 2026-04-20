using System;

namespace API.DTOs;

public class StudySessionResultDto
{
    public UserStatsDto UserStats { get; set; } = null!;
    public DeckStatsDto UpdatedDeckStats { get; set; } = null!;
}
