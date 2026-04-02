using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class StatsRepository(AppDbContext context) : IStatsRepository
{
    public void AddCardStats(CardStats cardStats)
    {
        context.CardStats.Add(cardStats);
    }

    public void AddCardStatsRange(IEnumerable<CardStats> cardStats)
    {
        context.CardStats.AddRange(cardStats);
    }

    public void AddDeckStats(DeckStats deckStats)
    {
        context.DeckStats.Add(deckStats);
    }

    public void AddUserStats(UserStats userStats)
    {
        context.UserStats.Add(userStats);
    }

    public async Task<CardStats?> GetCardStatsByCardIdAsync(string userId, Guid cardId)
    {
        return await context.CardStats
            .FirstOrDefaultAsync(cs => cs.AppUserId == userId && cs.CardId == cardId);
    }

    public async Task<IEnumerable<CardStats>> GetCardStatsForDeckAsync(string userId, Guid deckId)
    {
        return await context.CardStats
            .Include(cs => cs.Card)
            .Where(cs => cs.AppUserId == userId && cs.Card.DeckId == deckId)
            .ToListAsync();
    }

    public async Task<DeckStats?> GetDeckStatsAsync(string userId, Guid deckId)
    {
        return await context.DeckStats
            .FirstOrDefaultAsync(ds => ds.AppUserId == userId && ds.DeckId == deckId);
    }

    public async Task<IEnumerable<DeckStats>> GetLastPlayedDecksAsync(string userId, int limit)
    {
        return await context.DeckStats
            .Include(ds => ds.Deck)
            .Where(ds => ds.AppUserId == userId)
            .OrderByDescending(ds => ds.LastPlayedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<UserStats?> GetUserStatsAsync(string userId)
    {
        return await context.UserStats
            .FirstOrDefaultAsync(us => us.AppUserId == userId);
    }

    public void UpdateCardStats(CardStats cardStats)
    {
        context.Entry(cardStats).State = EntityState.Modified;
    }
}
