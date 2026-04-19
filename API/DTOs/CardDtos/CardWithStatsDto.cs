using System;
using System.Text.Json.Serialization;

namespace API.DTOs;

public class CardWithStatsDto
{
    [JsonPropertyName("data")]
    public CardDto Card { get; set; } = new CardDto();
    
    [JsonPropertyName("stats")]
    public CardStatsDto CardStats { get; set; } = new CardStatsDto();
}