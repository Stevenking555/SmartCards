using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Services;

public class CardImportService(IUnitOfWork unitOfWork) : ICardImportService
{
    public async Task<ImportResultDto> ImportCardsAsync(Guid deckId, string userId, string bulkText)
    {
        var result = new ImportResultDto();
        var cardsToAdd = new List<Card>();
        var cardStatsToAdd = new List<CardStats>();

        if (string.IsNullOrWhiteSpace(bulkText))
        {
            result.IsSuccess = false;
            return result;
        }

        var lines = bulkText.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
        int lineNumber = 0;

        foreach (var line in lines)
        {
            lineNumber++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var parts = line.Split(';', 2);
            if (parts.Length < 2 || string.IsNullOrWhiteSpace(parts[0]) || string.IsNullOrWhiteSpace(parts[1]))
            {
                result.FailedLines.Add($"Line {lineNumber}: {line}");
                continue;
            }

            var card = new Card
            {
                DeckId = deckId,
                Question = parts[0].Trim(),
                Answer = parts[1].Trim()
            };
            cardsToAdd.Add(card);

            var cardStats = new CardStats
            {
                AppUserId = userId,
                Card = card,
                BatchIndex = 0,
                RotationPoints = 0,
                RotationIndex = 0,
                IsMastered = false
            };
            cardStatsToAdd.Add(cardStats);
        }

        if (result.FailedLines.Count > 0)
        {
            result.IsSuccess = false;
            return result;
        }

        if (cardsToAdd.Count > 0)
        {
            unitOfWork.CardsRepository.AddCards(cardsToAdd);
            unitOfWork.StatsRepository.AddCardStatsRange(cardStatsToAdd);
            
            if (await unitOfWork.Complete())
            {
                result.IsSuccess = true;
                result.ImportedCount = cardsToAdd.Count;
                return result;
            }
            
            result.IsSuccess = false;
            return result;
        }

        result.IsSuccess = true;
        return result;
    }
}
