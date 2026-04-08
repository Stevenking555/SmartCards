using System;
using System.Collections.Generic;

namespace API.DTOs;

public class DeckForGameDto
{
    public DeckDto Deck { get; set; } = new DeckDto();
    public IEnumerable<CardWithStatsDto> Cards { get; set; } = new List<CardWithStatsDto>();
}