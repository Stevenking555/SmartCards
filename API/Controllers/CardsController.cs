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
public class CardsController(IUnitOfWork unitOfWork, IMapper mapper, ICardImportService importService) : BaseApiController
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
        if (deck.AppUserId != User.GetUserId()) return NotFound();

        var card = mapper.Map<Card>(createCardDto);
        card.DeckId = deckId;
        unitOfWork.CardsRepository.AddCard(card);

        var cardStats = new CardStats
        {
            AppUserId = User.GetUserId(),
            Card = card
        };
        unitOfWork.StatsRepository.AddCardStats(cardStats);

        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(User.GetUserId());
        if (userStats != null) userStats.TotalCards++;

        if (await unitOfWork.Complete()) return CreatedAtAction(nameof(GetCard), new { deckId, id = card.Id }, mapper.Map<CardWithStatsDto>(card));

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
        }

        return Ok(result);
    }

    [HttpPost("sync")]
    public async Task<ActionResult<IEnumerable<CardDto>>> SyncCards(Guid deckId, SyncCardsDto syncCardsDto)
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

        // 1. Process Additions
        foreach (var newCard in syncCardsDto.AddedCards)
        {
            var card = mapper.Map<Card>(newCard);
            card.DeckId = deckId;
            unitOfWork.CardsRepository.AddCard(card);

            var cardStats = new CardStats
            {
                AppUserId = userId,
                Card = card
            };
            unitOfWork.StatsRepository.AddCardStats(cardStats);

            results.Add(card);
            netCardChange++;
        }

        // 2. Process Updates
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

        // 3. Process Deletions
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
            return Ok(mapper.Map<IEnumerable<CardDto>>(results));
        }

        // Return empty OK if nothing was sent to sync (Complete returns false if no changes)
        if (netCardChange == 0 && !syncCardsDto.UpdatedCards.Any()) 
        {
            return Ok(new List<CardDto>());
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
        if (deck == null || deck.AppUserId != User.GetUserId()) return NotFound();

        unitOfWork.CardsRepository.DeleteCard(card);

        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(deck.AppUserId);
        if (userStats != null) userStats.TotalCards--;

        if (await unitOfWork.Complete()) return Ok();

        return BadRequest("Failed to delete card");
    }
}


