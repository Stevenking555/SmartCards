// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
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
    void AddDeckStats(DeckStats deckStats);
    
    Task<IEnumerable<CardStats>> GetCardStatsForDeckAsync(string userId, Guid deckId);
    Task<CardStats?> GetCardStatsByCardIdAsync(string userId, Guid cardId);
    void AddCardStats(CardStats cardStats);
    void AddCardStatsRange(IEnumerable<CardStats> cardStats);
    Task<int> GetMasteredCardCountAsync(string userId);
    Task<int> GetMasteredCountForDeckAsync(string userId, Guid deckId);
    void UpdateCardStats(CardStats cardStats);
}

