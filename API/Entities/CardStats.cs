using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("CardStats")]
public class CardStats
{
    public long Id { get; set; }

    [Required]
    public string AppUserId { get; set; } = null!;
    public AppUser AppUser { get; set; } = null!;

    [Required]
    public Guid CardId { get; set; }
    public Card Card { get; set; } = null!;

    public int BatchIndex { get; set; }
    public int RotationPoints { get; set; }
    public bool IsMastered { get; set; }
}
