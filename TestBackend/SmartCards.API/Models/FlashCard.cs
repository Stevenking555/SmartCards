using System.ComponentModel.DataAnnotations.Schema;

namespace SmartCards.API.Models
{
    [Table("flashcards")]
    public class FlashCard
    {
        public int Id { get; set; }

        [Column("deck_id")]
        public int DeckId { get; set; }

        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
    }
}