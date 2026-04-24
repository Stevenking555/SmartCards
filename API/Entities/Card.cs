// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("Cards")]
public class Card
{
    public Guid Id { get; set; }

    [Required]
    public Guid DeckId { get; set; }
    public Deck Deck { get; set; } = null!;

    [Required]
    public string Question { get; set; } = null!;

    [Required]
    public string Answer { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CardStats> CardStats { get; set; } = new List<CardStats>();
}

