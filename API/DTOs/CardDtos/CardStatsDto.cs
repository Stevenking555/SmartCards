using System;
using System.Text.Json.Serialization;

namespace API.DTOs;

public class CardStatsDto
{
    [JsonPropertyName("cardId")]
    public Guid CardId { get; set; }

    [JsonPropertyName("batchIndex")]
    public int BatchIndex { get; set; }

    [JsonPropertyName("rotationPoints")]
    public int RotationPoints { get; set; }

    [JsonPropertyName("rotationIndex")]
    public int RotationIndex { get; set; }

    [JsonPropertyName("isMastered")]
    public bool IsMastered { get; set; }
}