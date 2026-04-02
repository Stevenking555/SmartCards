using System;
using System.Collections.Generic;

namespace API.DTOs;

public class DeckWithStatsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Using a list because a single deck might have stats for multiple users technically (if shared), 
    // but in DeckStats it's user-specific, so if we query by userId, it will have at most 1 item.
    // However, returning a flat property is better if it's guaranteed 1:1 for the user fetching it.
    // Because EF returns a collection, I will map it to a single object in AutoMapper if needed, or just return the collection.
    public IEnumerable<DeckPageStatsDto> DeckStats { get; set; } = new List<DeckPageStatsDto>();
}

public class DeckWithCardsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public IEnumerable<CardDto> Cards { get; set; } = new List<CardDto>();
}

public class CardWithStatsDto
{
    public Guid Id { get; set; }
    public Guid DeckId { get; set; }
    public string Question { get; set; } = null!;
    public string Answer { get; set; } = null!;
    
    public IEnumerable<GameCardStatsDto> CardStats { get; set; } = new List<GameCardStatsDto>();
}

public class DeckForGameDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    
    public IEnumerable<CardWithStatsDto> Cards { get; set; } = new List<CardWithStatsDto>();
}
