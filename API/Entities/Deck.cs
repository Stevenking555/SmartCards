using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("Decks")]
public class Deck
{
    public Guid Id { get; set; }
    
    [Required]
    public string AppUserId { get; set; } = null!;
    public AppUser AppUser { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Card> Cards { get; set; } = new List<Card>();
    public ICollection<DeckStats> DeckStats { get; set; } = new List<DeckStats>();
}
