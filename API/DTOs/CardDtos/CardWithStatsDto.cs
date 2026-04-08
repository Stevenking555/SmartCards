using System;

namespace API.DTOs;

public class CardWithStatsDto
{
    public CardDto Card { get; set; } = new CardDto();
    public CardStatsDto CardStats { get; set; } = new CardStatsDto();
}