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
public class CardsController(IUnitOfWork unitOfWork, IMapper mapper, ICardImportService importService) : BaseApiController
{
    [HttpGet("{id}")]
    public async Task<ActionResult<CardDto>> GetCard(Guid id)
    {
        var card = await unitOfWork.CardsRepository.GetCardByIdAsync(id);
        if (card == null) return NotFound();
        
        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(card.DeckId);
        if (deck == null || deck.AppUserId != User.GetUserId()) return NotFound();

        return Ok(mapper.Map<CardDto>(card));
    }

    [HttpPost]
    public async Task<ActionResult<CardDto>> CreateCard(CreateCardDto createCardDto)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(createCardDto.DeckId);
        if (deck == null) return NotFound("Deck not found");
        if (deck.AppUserId != User.GetUserId()) return NotFound();

        var card = mapper.Map<Card>(createCardDto);
        unitOfWork.CardsRepository.AddCard(card);

        // Automatically initialize CardStats for the creator
        var cardStats = new CardStats
        {
            AppUserId = User.GetUserId(),
            Card = card,
            BatchIndex = 0,
            RotationPoints = 0,
            IsMastered = false
        };
        unitOfWork.StatsRepository.AddCardStats(cardStats);

        if (await unitOfWork.Complete()) return Ok(mapper.Map<CardDto>(card));

        return BadRequest("Failed to create card");
    }

    [HttpPost("import/{deckId}")]
    public async Task<ActionResult<ImportResultDto>> ImportCards(Guid deckId, ImportCardsDto importDto)
    {
        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(deckId);
        if (deck == null) return NotFound("Deck not found");
        if (deck.AppUserId != User.GetUserId()) return NotFound();

        var userId = User.GetUserId();
        var result = await importService.ImportCardsAsync(deckId, userId, importDto.BulkText);

        if (!result.IsSuccess && result.FailedLines.Count == 0)
        {
            return BadRequest("Failed to save imported cards");
        }

        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateCard(Guid id, CreateCardDto updateCardDto)
    {
        var card = await unitOfWork.CardsRepository.GetCardByIdAsync(id);
        if (card == null) return NotFound();

        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(card.DeckId);
        if (deck == null || deck.AppUserId != User.GetUserId()) return NotFound();

        mapper.Map(updateCardDto, card);
        unitOfWork.CardsRepository.UpdateCard(card);

        if (await unitOfWork.Complete()) return NoContent();

        return BadRequest("Failed to update card");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCard(Guid id)
    {
        var card = await unitOfWork.CardsRepository.GetCardByIdAsync(id);
        if (card == null) return NotFound();

        var deck = await unitOfWork.DecksRepository.GetDeckByIdAsync(card.DeckId);
        if (deck == null || deck.AppUserId != User.GetUserId()) return NotFound();

        unitOfWork.CardsRepository.DeleteCard(card);

        if (await unitOfWork.Complete()) return Ok();

        return BadRequest("Failed to delete card");
    }
}


