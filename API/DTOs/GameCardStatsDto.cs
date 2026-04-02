using System;

namespace API.DTOs;

public class GameCardStatsDto
{
    public long Id { get; set; }
    public Guid CardId { get; set; }
    public int BatchIndex { get; set; }
    public int RotationPoints { get; set; }
    public bool IsMastered { get; set; }
}
