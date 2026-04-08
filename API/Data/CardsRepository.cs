using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class CardsRepository(AppDbContext context) : ICardsRepository
{
    public async Task<int> GetCardCountAsync(string userId)
    {
        return await context.Cards.CountAsync(c => c.Deck.AppUserId == userId);
    }

    public void AddCard(Card card)
    {
        context.Cards.Add(card);
    }

    public void AddCards(IEnumerable<Card> cards)
    {
        context.Cards.AddRange(cards);
    }

    public void DeleteCard(Card card)
    {
        context.Cards.Remove(card);
    }

    public async Task<Card?> GetCardByIdAsync(Guid id)
    {
        return await context.Cards.FindAsync(id);
    }

    public async Task<IEnumerable<Card>> GetCardsByDeckIdAsync(Guid deckId)
    {
        return await context.Cards
            .Where(c => c.DeckId == deckId)
            .ToListAsync();
    }

    public void UpdateCard(Card card)
    {
        context.Entry(card).State = EntityState.Modified;
    }
}
