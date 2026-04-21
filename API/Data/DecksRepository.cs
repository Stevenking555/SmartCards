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
    public async Task<int> GetDeckCountAsync(string userId)
    {
        return await context.Decks.CountAsync(d => d.AppUserId == userId);
    }

    public void AddDeck(Deck deck)
    {
        context.Decks.Add(deck);
    }

    public void DeleteDeck(Deck deck)
    {
        // DeckStats must still be removed manually (no cascade from Deck→DeckStats)
        var deckStats = context.DeckStats.Where(ds => ds.DeckId == deck.Id);
        context.DeckStats.RemoveRange(deckStats);

        // CardStats are now auto-deleted by the DB cascade (Card→CardStats: Cascade)
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
            .Include(d => d.DeckStats.Where(ds => ds.AppUserId == userId))
            .OrderByDescending(d => d.DeckStats.Where(ds => ds.AppUserId == userId)
                .Select(ds => (DateTime?)ds.LastPlayedAt)
                .Max() ?? d.CreatedAt)
            .ThenByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Deck>> GetLastPlayedDecksAsync(string userId, int limit)
    {
        return await context.Decks
            .Include(d => d.DeckStats.Where(ds => ds.AppUserId == userId))
            .Include(d => d.Cards)
                .ThenInclude(c => c.CardStats.Where(cs => cs.AppUserId == userId))
            .Where(d => d.AppUserId == userId && d.DeckStats.Any(ds => ds.AppUserId == userId))
            .OrderByDescending(d => d.DeckStats.Where(ds => ds.AppUserId == userId).Max(ds => ds.LastPlayedAt))
            .Take(limit)
            .AsSplitQuery()
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
            .Include(d => d.DeckStats.Where(ds => ds.AppUserId == userId))
            .Include(d => d.Cards.OrderByDescending(c => c.CreatedAt))
                .ThenInclude(c => c.CardStats.Where(cs => cs.AppUserId == userId))
            .AsSplitQuery()
            .FirstOrDefaultAsync(d => d.Id == deckId && d.AppUserId == userId);
    }

    public async Task<Deck?> GetDeckForGameAsync(string userId, Guid deckId)
    {
        return await context.Decks
            .Include(d => d.DeckStats.Where(ds => ds.AppUserId == userId))
            .Include(d => d.Cards.OrderByDescending(c => c.CreatedAt))
                .ThenInclude(c => c.CardStats.Where(cs => cs.AppUserId == userId))
            .AsSplitQuery()
            .FirstOrDefaultAsync(d => d.Id == deckId && d.AppUserId == userId);
    }

    public void UpdateDeck(Deck deck)
    {
        context.Entry(deck).State = EntityState.Modified;
    }
}
