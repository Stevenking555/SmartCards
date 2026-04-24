// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
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
[Route("api/decks/{deckId}/[controller]")]
public class CardsController(IUnitOfWork unitOfWork, IMapper mapper, ICardImportService importService, IStatsService statsService) : BaseApiController
{
    [HttpGet("{id}")]
    public async Task<ActionResult<CardDto>> GetCard(Guid deckId, Guid id)
    {
        var card = await unitOfWork.CardsRepository.GetCardByIdAsync(id);
        if (card == null) return NotFound();
        
        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(card.DeckId);
        if (deck == null || deck.AppUserId != User.GetUserId()) return NotFound();

        return Ok(mapper.Map<CardDto>(card));
    }

    [HttpPost]
    public async Task<ActionResult<CardWithStatsDto>> CreateCard(Guid deckId, CreateCardDto createCardDto)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(deckId);
        if (deck == null) return NotFound("Deck not found");
        var userId = User.GetUserId();
        if (deck.AppUserId != userId) return NotFound();

        var card = mapper.Map<Card>(createCardDto);
        card.DeckId = deckId;
        unitOfWork.CardsRepository.AddCard(card);

        var cardStats = new CardStats
        {
            AppUserId = userId,
            Card = card
        };
        unitOfWork.StatsRepository.AddCardStats(cardStats);

        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(userId);
        if (userStats != null) userStats.TotalCards++;

        if (await unitOfWork.Complete()) 
        {
            await statsService.RecalculateDeckKnowledgeAsync(userId, deckId);
            return CreatedAtAction(nameof(GetCard), new { deckId, id = card.Id }, mapper.Map<CardWithStatsDto>(card));
        }

        return BadRequest("Failed to create card");
    }

    [HttpPost("import")]
    public async Task<ActionResult<ImportResultDto>> ImportCards(Guid deckId, ImportCardsDto importDto)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(deckId);
        if (deck == null) return NotFound("Deck not found");
        var userId = User.GetUserId();
        if (deck.AppUserId != userId) return NotFound();

        var result = await importService.ImportCardsAsync(deckId, userId, importDto.BulkText);

        if (!result.IsSuccess && result.FailedLines.Count == 0)
        {
            return BadRequest("Failed to save imported cards");
        }

        // Update TotalCards safely
        if (result.IsSuccess && result.ImportedCount > 0)
        {
            var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(userId);
            if (userStats != null)
            {
                userStats.TotalCards += result.ImportedCount;
                await unitOfWork.Complete();
            }
            await statsService.RecalculateDeckKnowledgeAsync(userId, deckId);
        }

        return Ok(result);
    }

    [HttpPost("sync")]
    public async Task<ActionResult<DeckForGameDto>> SyncCards(Guid deckId, SyncCardsDto syncCardsDto)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(deckId);
        if (deck == null) return NotFound("Deck not found");
        var userId = User.GetUserId();
        if (deck.AppUserId != userId) return NotFound();

        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(userId);
        if (userStats == null) 
        {
            userStats = new UserStats { AppUserId = userId };
            unitOfWork.StatsRepository.AddUserStats(userStats);
        }

        var results = new List<Card>();
        int netCardChange = 0;

        foreach (var newCard in syncCardsDto.AddedCards)
        {
            var card = mapper.Map<Card>(newCard);
            card.DeckId = deckId;
            unitOfWork.CardsRepository.AddCard(card);

            var cardStats = new CardStats { AppUserId = userId, Card = card };
            unitOfWork.StatsRepository.AddCardStats(cardStats);

            results.Add(card);
            netCardChange++;
        }

        foreach (var updateCard in syncCardsDto.UpdatedCards)
        {
            var card = await unitOfWork.CardsRepository.GetCardByIdAsync(updateCard.Id);
            if (card != null && card.DeckId == deckId)
            {
                mapper.Map(updateCard, card);
                unitOfWork.CardsRepository.UpdateCard(card);
                results.Add(card);
            }
        }

        foreach (var deletedId in syncCardsDto.DeletedCardIds)
        {
            var card = await unitOfWork.CardsRepository.GetCardByIdAsync(deletedId);
            if (card != null && card.DeckId == deckId)
            {
                unitOfWork.CardsRepository.DeleteCard(card);
                netCardChange--;
            }
        }

        userStats.TotalCards += netCardChange;
        
        if (await unitOfWork.Complete()) 
        {
            if (netCardChange != 0)
            {
                await statsService.RecalculateDeckKnowledgeAsync(userId, deckId);
            }
            // Return the full deck with updated cards and stats
            var updatedDeck = await unitOfWork.DecksRepository.GetDeckForGameAsync(userId, deckId);
            return Ok(mapper.Map<DeckForGameDto>(updatedDeck));
        }

        // Return current deck if nothing was sent to sync (Complete returns false if no changes)
        if (netCardChange == 0 && !syncCardsDto.UpdatedCards.Any()) 
        {
            var currentDeck = await unitOfWork.DecksRepository.GetDeckForGameAsync(userId, deckId);
            return Ok(mapper.Map<DeckForGameDto>(currentDeck));
        }

        return BadRequest("Failed to sync cards");
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CardDto>> UpdateCard(Guid deckId, Guid id, CreateCardDto updateCardDto)
    {
        var card = await unitOfWork.CardsRepository.GetCardByIdAsync(id);
        if (card == null) return NotFound();

        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(card.DeckId);
        if (deck == null || deck.AppUserId != User.GetUserId()) return NotFound();

        mapper.Map(updateCardDto, card);
        unitOfWork.CardsRepository.UpdateCard(card);

        if (await unitOfWork.Complete()) return Ok(mapper.Map<CardDto>(card));

        return BadRequest("Failed to update card");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCard(Guid deckId, Guid id)
    {
        var card = await unitOfWork.CardsRepository.GetCardByIdAsync(id);
        if (card == null) return NotFound();

        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(card.DeckId);
        var userId = User.GetUserId();
        if (deck == null || deck.AppUserId != userId) return NotFound();

        unitOfWork.CardsRepository.DeleteCard(card);

        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(userId);
        if (userStats != null) userStats.TotalCards--;

        if (await unitOfWork.Complete()) 
        {
            await statsService.RecalculateDeckKnowledgeAsync(userId, deckId);
            return Ok();
        }

        return BadRequest("Failed to delete card");
    }
}



