using System;
using System.Collections.Generic;

namespace API.DTOs;

public class DeckDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public double Progress { get; set; }
    public int TimeSpentMinutes { get; set; }
    public IEnumerable<CardDto> Cards { get; set; } = new List<CardDto>();
}
