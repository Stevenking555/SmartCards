using SmartCards.API.Models;
using System.Xml.Linq;

namespace SmartCards.API.Services
{
    public class FlashCardService
    {
        static List<FlashCard> flashCards = new List<FlashCard>();

        static FlashCardService()
        {
            flashCards = new List<FlashCard>
            {
                new FlashCard { Id = 1, DeckId = 1, Question = "How are you?", Answer = "Gooood :)" },
                new FlashCard { Id = 1, DeckId = 1, Question = "Who are you?", Answer = "Not good >:)" },
                new FlashCard { Id = 2, DeckId = 2, Question = "Cats or dogs?", Answer = "Both" },
                new FlashCard { Id = 2, DeckId = 2, Question = "Cats or dogs?", Answer = "None" }
            };
        }

        public static List<FlashCard> GetAll()
        {
            return flashCards;
        }

        public static FlashCard? Get(int id)
        {
            return flashCards.FirstOrDefault(x => x.Id == id);
        }

        public static void Add(FlashCard FlashCard)
        {
            flashCards.Add(FlashCard);
        }

        public static void Update(FlashCard FlashCard)
        {
            for (int i = 0; i < flashCards.Count; i++)
            {
                if (flashCards[i].Id == FlashCard.Id)
                {
                    flashCards[i] = FlashCard;
                    return;
                }
            }
        }

        public static void Delete(int id)
        {
            var FlashCard = Get(id);
            if (FlashCard != null)
            {
                flashCards.Remove(FlashCard);
            }
        }
    }
}
