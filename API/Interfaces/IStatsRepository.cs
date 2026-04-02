using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;

namespace API.Interfaces;

public interface IStatsRepository
{
    Task<UserStats?> GetUserStatsAsync(string userId);
    void AddUserStats(UserStats userStats);
    
    Task<DeckStats?> GetDeckStatsAsync(string userId, Guid deckId);
    Task<IEnumerable<DeckStats>> GetLastPlayedDecksAsync(string userId, int limit);
    void AddDeckStats(DeckStats deckStats);
    
    Task<IEnumerable<CardStats>> GetCardStatsForDeckAsync(string userId, Guid deckId);
    Task<CardStats?> GetCardStatsByCardIdAsync(string userId, Guid cardId);
    void AddCardStats(CardStats cardStats);
    void AddCardStatsRange(IEnumerable<CardStats> cardStats);
    void UpdateCardStats(CardStats cardStats);
}
