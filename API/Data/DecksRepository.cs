using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DecksRepository(AppDbContext context) : IDecksRepository
{
    public void AddDeck(Deck deck)
    {
        context.Decks.Add(deck);
    }

    public void DeleteDeck(Deck deck)
    {
        context.Decks.Remove(deck);
    }

    public async Task<Deck?> GetDeckByIdAsync(Guid id)
    {
        return await context.Decks.FindAsync(id);
    }

    public async Task<IEnumerable<Deck>> GetDecksAsync(string userId)
    {
        return await context.Decks
            .Where(d => d.AppUserId == userId)
            .ToListAsync();
    }

    public async Task<Deck?> GetDeckWithStatsAsync(string userId, Guid deckId)
    {
        return await context.Decks
            .Include(d => d.DeckStats.Where(ds => ds.AppUserId == userId))
            .FirstOrDefaultAsync(d => d.Id == deckId && d.AppUserId == userId);
    }

    public async Task<Deck?> GetDeckWithCardsAsync(string userId, Guid deckId)
    {
        return await context.Decks
            .Include(d => d.Cards)
            .AsSplitQuery()
            .FirstOrDefaultAsync(d => d.Id == deckId && d.AppUserId == userId);
    }

    public async Task<Deck?> GetDeckForGameAsync(string userId, Guid deckId)
    {
        return await context.Decks
            .Include(d => d.Cards)
                .ThenInclude(c => c.CardStats.Where(cs => cs.AppUserId == userId))
            .AsSplitQuery()
            .FirstOrDefaultAsync(d => d.Id == deckId && d.AppUserId == userId);
    }

    public void UpdateDeck(Deck deck)
    {
        context.Entry(deck).State = EntityState.Modified;
    }
}
