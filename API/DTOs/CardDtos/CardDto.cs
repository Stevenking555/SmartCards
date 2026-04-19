using System;
using System.Text.Json.Serialization;

namespace API.DTOs;

public class CardDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("deckId")]
    public Guid DeckId { get; set; }

    [JsonPropertyName("question")]
    public string Question { get; set; } = null!;

    [JsonPropertyName("answer")]
    public string Answer { get; set; } = null!;
}
