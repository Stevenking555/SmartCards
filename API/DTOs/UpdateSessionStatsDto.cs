// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;
using System.Collections.Generic;

namespace API.DTOs;

public class UpdateSessionStatsDto
{
    public Guid DeckId { get; set; }
    public long FlippedCardsTotal { get; set; }
    public int FlippedCardsToday { get; set; }
    public DateTime LastFlipAt { get; set; }
    public int TimeSpentMinutes { get; set; }
    public DateTime LastPlayedAt { get; set; }
    
    public IEnumerable<CardSessionUpdateDto> Cards { get; set; } = new List<CardSessionUpdateDto>();
}

public class CardSessionUpdateDto
{
    public Guid CardId { get; set; }
    public int BatchIndex { get; set; }
    public int RotationPoints { get; set; }
    public int RotationIndex { get; set; }
    public bool IsMastered { get; set; }
}

