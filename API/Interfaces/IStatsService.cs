// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;

namespace API.Interfaces;

public interface IStatsService
{
    Task<UserStatsDto> GetUserStatsAsync(string userId);
    Task<DeckStatsDto> GetDeckStatsAsync(string userId, Guid deckId);
    Task<IEnumerable<CardStatsDto>> GetCardStatsForDeckAsync(string userId, Guid deckId);
    Task<StudySessionResultDto?> SaveStudySessionAsync(string userId, UpdateSessionStatsDto updateDto);
    Task RecalculateDeckKnowledgeAsync(string userId, Guid deckId);
}

