using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DTOs;

public class DeckWithStatsDto
{
    [JsonPropertyName("info")]
    public DeckDto Deck { get; set; } = new DeckDto();
    
    [JsonPropertyName("stats")]
    public DeckStatsDto DeckStats { get; set; } = new DeckStatsDto();
}