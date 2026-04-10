using System;
using System.Collections.Generic;
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

    [HttpGet("{id}")]
    public async Task<ActionResult<DeckDto>> GetDeck(Guid id)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(id);
        if (deck == null) return NotFound();
        
        // Ensure user owns the deck
        if (deck.AppUserId != User.GetUserId()) return NotFound();
        
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
        
        // Automatically initialize DeckStats for the creator
        var deckStats = new DeckStats
        {
            AppUserId = deck.AppUserId,
            Deck = deck,
            KnowledgePercentage = 0,
            TimeSpentMinutes = 0,
            LastPlayedAt = DateTime.UtcNow
        };
        unitOfWork.StatsRepository.AddDeckStats(deckStats);

        if (await unitOfWork.Complete()) return Ok(mapper.Map<DeckDto>(deck));

        return BadRequest("Failed to create deck");
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

        unitOfWork.DecksRepository.DeleteDeck(deck);

        if (await unitOfWork.Complete()) return Ok();

        return BadRequest("Failed to delete deck");
    }
}


