using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;

namespace API.Interfaces;

public interface IStatsService
{
    Task<HomePageStatsDto> GetHomePageStatsAsync(string userId);
    Task<DeckPageStatsDto> GetDeckPageStatsAsync(string userId, Guid deckId);
    Task<IEnumerable<GameCardStatsDto>> GetGameCardStatsAsync(string userId, Guid deckId);
    Task<bool> UpdateSessionStatsAsync(string userId, UpdateSessionStatsDto updateDto);
}
