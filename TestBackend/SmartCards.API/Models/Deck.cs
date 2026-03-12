using System.ComponentModel.DataAnnotations.Schema;

namespace SmartCards.API.Models
{
    [Table("decks")]
    public class Deck
    {
        public int Id { get; set; }

        [Column("owner_id")]
        public int OwnerId { get; set; }

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Category { get; set; }

        [Column("is_public")]
        public bool IsPublic { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}