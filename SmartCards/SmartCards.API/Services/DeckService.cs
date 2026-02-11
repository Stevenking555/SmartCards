using SmartCards.API.Models;
using System.Xml.Linq;

namespace SmartCards.API.Services
{
    public class DeckService
    {
        static List<Deck> decks = new List<Deck>();

        static DeckService()
        {
            decks = new List<Deck>
            {
                new Deck { Id = 1, OwnerId = 1, Title = "SocialQuiz", Description = "Learn how to socialize", Category = "Social", IsPublic = true, CreatedAt = DateTime.Now },
                new Deck { Id = 2, OwnerId = 2, Title = "PetQuiz", Description = "Find out your favourite pet", Category = "Fun", IsPublic = false, CreatedAt = DateTime.Now }
            };
        }

        public static List<Deck> GetAll()
        {
            return decks;
        }

        public static Deck? Get(int id)
        {
            return decks.FirstOrDefault(x => x.Id == id);
        }

        public static void Add(Deck Deck)
        {
            decks.Add(Deck);
        }

        public static void Update(Deck Deck)
        {
            for (int i = 0; i < decks.Count; i++)
            {
                if (decks[i].Id == Deck.Id)
                {
                    decks[i] = Deck;
                    return;
                }
            }
        }

        public static void Delete(int id)
        {
            var Deck = Get(id);
            if (Deck != null)
            {
                decks.Remove(Deck);
            }
        }
    }
}
