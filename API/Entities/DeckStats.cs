using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("DeckStats")]
public class DeckStats
{
    public long Id { get; set; }

    [Required]
    public string AppUserId { get; set; } = null!;
    public AppUser AppUser { get; set; } = null!;

    [Required]
    public Guid DeckId { get; set; }
    public Deck Deck { get; set; } = null!;

    public int KnowledgePercentage { get; set; }
    public int TimeSpentMinutes { get; set; }
    public DateTime LastPlayedAt { get; set; }
}
