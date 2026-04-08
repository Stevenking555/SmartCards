using System;
using System.Collections.Generic;

namespace API.DTOs;

public class DeckWithStatsDto
{
    public DeckDto Deck { get; set; } = new DeckDto();
    public DeckStatsDto DeckStats { get; set; } = new DeckStatsDto();
}