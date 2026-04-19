using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;

namespace API.Interfaces;

public interface IDecksRepository
{
    Task<IEnumerable<Deck>> GetDecksAsync(string userId);
    Task<IEnumerable<Deck>> GetLastPlayedDecksAsync(string userId, int limit);
    Task<Deck?> GetDeckByIdAsync(Guid id);
    Task<Deck?> GetDeckWithStatsAsync(string userId, Guid deckId);
    Task<Deck?> GetDeckWithCardsAsync(string userId, Guid deckId);
    Task<Deck?> GetDeckForGameAsync(string userId, Guid deckId);
    Task<int> GetDeckCountAsync(string userId);
    void AddDeck(Deck deck);
    void UpdateDeck(Deck deck);
    void DeleteDeck(Deck deck);
}
