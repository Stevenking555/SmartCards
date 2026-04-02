using System;

namespace API.DTOs;

public class CardDto
{
    public Guid Id { get; set; }
    public Guid DeckId { get; set; }
    public string Question { get; set; } = null!;
    public string Answer { get; set; } = null!;
}
