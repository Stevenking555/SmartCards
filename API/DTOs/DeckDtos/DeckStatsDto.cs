// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System.Text.Json.Serialization;

namespace API.DTOs;

public class DeckStatsDto
{
    [JsonPropertyName("knowledgePercentage")]
    public int KnowledgePercentage { get; set; }

    [JsonPropertyName("timeSpentMinutes")]
    public int TimeSpentMinutes { get; set; }

    [JsonPropertyName("goal")]
    public string Goal { get; set; } = "weeks";
}

