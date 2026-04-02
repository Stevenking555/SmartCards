using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;

namespace API.Interfaces;

public interface ICardsRepository
{
    Task<IEnumerable<Card>> GetCardsByDeckIdAsync(Guid deckId);
    Task<Card?> GetCardByIdAsync(Guid id);
    void AddCard(Card card);
    void AddCards(IEnumerable<Card> cards);
    void UpdateCard(Card card);
    void DeleteCard(Card card);
}
