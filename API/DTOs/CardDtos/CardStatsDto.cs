using System;

namespace API.DTOs;

public class CardStatsDto
{
    public Guid CardId { get; set; }
    public int BatchIndex { get; set; }
    public int RotationPoints { get; set; }
    public bool IsMastered { get; set; }
}