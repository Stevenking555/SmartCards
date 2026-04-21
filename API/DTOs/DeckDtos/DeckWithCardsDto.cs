using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DTOs;

public class DeckWithCardsDto
{
    [JsonPropertyName("info")]
    public DeckDto Deck { get; set; } = null!;

    [JsonPropertyName("cards")]
    public List<CardWithStatsDto> Cards { get; set; } = new();

    [JsonPropertyName("stats")]
    public DeckStatsDto Stats { get; set; } = null!;
}
