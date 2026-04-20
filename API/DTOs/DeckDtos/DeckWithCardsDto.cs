using System;
using System.Collections.Generic;

namespace API.DTOs;

public class DeckWithCardsDto
{
    public DeckDto Deck { get; set; } = null!;
    public List<CardWithStatsDto> Cards { get; set; } = new();
}
