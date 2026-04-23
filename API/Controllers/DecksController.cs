using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class DecksController(IUnitOfWork unitOfWork, IMapper mapper) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DeckDto>>> GetDecks()
    {
        var decks = await unitOfWork.DecksRepository.GetDecksAsync(User.GetUserId());
        return Ok(mapper.Map<IEnumerable<DeckDto>>(decks));
    }

    [HttpGet("with-stats")]
    public async Task<ActionResult<IEnumerable<DeckWithStatsDto>>> GetDecksWithStats()
    {
        var decks = await unitOfWork.DecksRepository.GetDecksAsync(User.GetUserId());
        return Ok(mapper.Map<IEnumerable<DeckWithStatsDto>>(decks));
    }

    [HttpGet("last-played")]
    public async Task<ActionResult<IEnumerable<DeckForGameDto>>> GetLastPlayedDecks([FromQuery] int limit = 5)
    {
        var decks = await unitOfWork.DecksRepository.GetLastPlayedDecksAsync(User.GetUserId(), limit);
        return Ok(mapper.Map<IEnumerable<DeckForGameDto>>(decks));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DeckDto>> GetDeck(Guid id)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(id);
        if (deck == null || deck.AppUserId != User.GetUserId()) return NotFound();
        
        return Ok(mapper.Map<DeckDto>(deck));
    }

    [HttpGet("{id}/with-stats")]
    public async Task<ActionResult<DeckWithStatsDto>> GetDeckWithStats(Guid id)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckWithStatsAsync(User.GetUserId(), id);
        if (deck == null) return NotFound();
        
        return Ok(mapper.Map<DeckWithStatsDto>(deck));
    }

    [HttpGet("{id}/with-cards")]
    public async Task<ActionResult<DeckWithCardsDto>> GetDeckWithCards(Guid id)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckWithCardsAsync(User.GetUserId(), id);
        if (deck == null) return NotFound();
        
        return Ok(mapper.Map<DeckWithCardsDto>(deck));
    }

    [HttpGet("{id}/for-game")]
    public async Task<ActionResult<DeckForGameDto>> GetDeckForGame(Guid id)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckForGameAsync(User.GetUserId(), id);
        if (deck == null) return NotFound();
        
        return Ok(mapper.Map<DeckForGameDto>(deck));
    }

    [HttpPost]
    public async Task<ActionResult<DeckDto>> CreateDeck(CreateDeckDto createDeckDto)
    {
        var deck = mapper.Map<Deck>(createDeckDto);
        deck.AppUserId = User.GetUserId();

        unitOfWork.DecksRepository.AddDeck(deck);
        
        var deckStats = new DeckStats
        {
            AppUserId = deck.AppUserId,
            Deck = deck,
            LastPlayedAt = DateTime.UtcNow,
            Goal = createDeckDto.Goal
        };
        unitOfWork.StatsRepository.AddDeckStats(deckStats);

        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(deck.AppUserId);
        if (userStats != null) userStats.TotalDecks++;

        if (await unitOfWork.Complete()) return Ok(mapper.Map<DeckDto>(deck));

        return BadRequest("Failed to create deck");
    }

    [HttpPost("sync")]
    public async Task<ActionResult<IEnumerable<DeckDto>>> SyncDecks(SyncDecksDto syncDecksDto)
    {
        var userId = User.GetUserId();
        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(userId);
        if (userStats == null)
        {
            userStats = new UserStats { AppUserId = userId };
            unitOfWork.StatsRepository.AddUserStats(userStats);
        }

        var results = new List<Deck>();
        int netDeckChange = 0;

        foreach (var newDeck in syncDecksDto.AddedDecks)
        {
            var deck = mapper.Map<Deck>(newDeck);
            deck.AppUserId = userId;
            unitOfWork.DecksRepository.AddDeck(deck);

            var deckStats = new DeckStats
            {
                AppUserId = userId,
                Deck = deck,
                LastPlayedAt = DateTime.UtcNow,
                Goal = newDeck.Goal
            };
            unitOfWork.StatsRepository.AddDeckStats(deckStats);
            
            results.Add(deck);
            netDeckChange++;
        }

        foreach (var updateDeck in syncDecksDto.UpdatedDecks)
        {
            var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(updateDeck.Id);
            if (deck != null && deck.AppUserId == userId)
            {
                mapper.Map(updateDeck, deck);
                unitOfWork.DecksRepository.UpdateDeck(deck);
                results.Add(deck);
            }
        }

        foreach (var deletedId in syncDecksDto.DeletedDeckIds)
        {
            var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(deletedId);
            if (deck != null && deck.AppUserId == userId)
            {
                unitOfWork.DecksRepository.DeleteDeck(deck);
                netDeckChange--;
            }
        }

        userStats.TotalDecks += netDeckChange;

        if (await unitOfWork.Complete())
        {
            return Ok(mapper.Map<IEnumerable<DeckDto>>(results));
        }

        if (netDeckChange == 0 && !syncDecksDto.UpdatedDecks.Any())
        {
            return Ok(new List<DeckDto>());
        }

        return BadRequest("Failed to sync decks");
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateDeck(Guid id, CreateDeckDto updateDeckDto)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(id);
        if (deck == null) return NotFound();
        if (deck.AppUserId != User.GetUserId()) return NotFound();

        mapper.Map(updateDeckDto, deck);
        unitOfWork.DecksRepository.UpdateDeck(deck);

        if (await unitOfWork.Complete()) return NoContent();

        return BadRequest("Failed to update deck");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteDeck(Guid id)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(id);
        if (deck == null) return NotFound();
        if (deck.AppUserId != User.GetUserId()) return NotFound();

        var cardCount = 0;
        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(deck.AppUserId);
        if (userStats != null) 
        {
            userStats.TotalDecks--;
            cardCount = await unitOfWork.CardsRepository.GetCardCountForDeckAsync(id);
            userStats.TotalCards -= cardCount;
        }

        unitOfWork.DecksRepository.DeleteDeck(deck);

        if (await unitOfWork.Complete()) return Ok(new { cardCount });

        return BadRequest("Failed to delete deck");
    }
}


