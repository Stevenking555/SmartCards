using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;

namespace API.Services;

public class StatsService(IUnitOfWork unitOfWork, IMapper mapper) : IStatsService
{
    public async Task<DeckStatsDto> GetDeckStatsAsync(string userId, Guid deckId)
    {
        var deckStats = await unitOfWork.StatsRepository.GetDeckStatsAsync(userId, deckId);
        if (deckStats == null) return new DeckStatsDto();

        return mapper.Map<DeckStatsDto>(deckStats);
    }

    public async Task<IEnumerable<CardStatsDto>> GetCardStatsForDeckAsync(string userId, Guid deckId)
    {
        var cardStats = await unitOfWork.StatsRepository.GetCardStatsForDeckAsync(userId, deckId);
        return mapper.Map<IEnumerable<CardStatsDto>>(cardStats);
    }

    public async Task<UserStatsDto> GetUserStatsAsync(string userId)
    {
        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(userId);
        if (userStats == null)
        {
            userStats = new UserStats
            {
                AppUserId = userId,
                WeeklyActivityJson = "[45,15,60,30,20,50,10]" // Seed with mock data
            };
            unitOfWork.StatsRepository.AddUserStats(userStats);
        }
        else if (userStats.WeeklyActivityJson == "[0,0,0,0,0,0,0]" || string.IsNullOrEmpty(userStats.WeeklyActivityJson))
        {
            userStats.WeeklyActivityJson = "[45,15,60,30,20,50,10]"; // Populate existing empty stats
        }

        var lastDecks = await unitOfWork.StatsRepository.GetLastPlayedDecksAsync(userId, 5);

        // Update totals
        userStats.TotalDecks = await unitOfWork.DecksRepository.GetDeckCountAsync(userId);
        userStats.TotalCards = await unitOfWork.CardsRepository.GetCardCountAsync(userId);
        userStats.TotalMasteredCards = await unitOfWork.StatsRepository.GetMasteredCardCountAsync(userId);

        // Save totals
        await unitOfWork.Complete();

        // Map simple fields from entity to DTO
        var dto = mapper.Map<UserStatsDto>(userStats);

        // Manually add the data that wasn't in the entity
        dto.LastPlayedDecks = lastDecks.Select(ds => new LastPlayedDeckDto
        {
            DeckId = ds.DeckId,
            Title = ds.Deck.Title,
            LastPlayedAt = ds.LastPlayedAt
        }).ToList();

        return dto;
    }

    public async Task<bool> UpdateSessionStatsAsync(string userId, UpdateSessionStatsDto updateDto)
    {
        // 1. Update UserStats
        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(userId);
        if (userStats == null)
        {
            userStats = new UserStats { AppUserId = userId, LastFlipAt = updateDto.LastFlipAt };
            unitOfWork.StatsRepository.AddUserStats(userStats);
        }

        userStats.FlippedCardsTotal = updateDto.FlippedCardsTotal;
        userStats.FlippedCardsToday = updateDto.FlippedCardsToday;


        // Streak logic
        var daysSinceLastFlip = (updateDto.LastFlipAt.Date - userStats.LastFlipAt.Date).Days;
        if (daysSinceLastFlip == 1)
        {
            userStats.LearningStreak++;
        }
        else if (daysSinceLastFlip > 1)
        {
            userStats.LearningStreak = 1;
        }
        userStats.LastFlipAt = updateDto.LastFlipAt;

        // 2. Fetch/Create DeckStats first to calculate the delta for Weekly Activity
        var deckStats = await unitOfWork.StatsRepository.GetDeckStatsAsync(userId, updateDto.DeckId);
        int oldTimeSpent = deckStats?.TimeSpentMinutes ?? 0;
        
        if (deckStats == null)
        {
            deckStats = new DeckStats { AppUserId = userId, DeckId = updateDto.DeckId };
            unitOfWork.StatsRepository.AddDeckStats(deckStats);
        }

        int sessionTimeDelta = updateDto.TimeSpentMinutes - oldTimeSpent;
        if (sessionTimeDelta < 0) sessionTimeDelta = 0;

        deckStats.TimeSpentMinutes = updateDto.TimeSpentMinutes;
        deckStats.LastPlayedAt = updateDto.LastPlayedAt;

        // Weekly Activity JSON Logic uses the calculated delta
        var weeklyActivity = string.IsNullOrEmpty(userStats.WeeklyActivityJson) 
            ? new List<int>(new int[7]) 
            : JsonSerializer.Deserialize<List<int>>(userStats.WeeklyActivityJson) ?? new List<int>(new int[7]);
        
        int dayOfWeekIndex = (int)DateTime.UtcNow.DayOfWeek;
        weeklyActivity[dayOfWeekIndex] += sessionTimeDelta;
        userStats.WeeklyActivityJson = JsonSerializer.Serialize(weeklyActivity);

        // Knowledge percentage calculation (e.g. based on mastered cards over total update cards)
        if (updateDto.Cards.Any())
        {
            int masteredCount = updateDto.Cards.Count(c => c.IsMastered);
            deckStats.KnowledgePercentage = (int)((double)masteredCount / updateDto.Cards.Count() * 100);
        }

        // 3. Update CardStats
        var existingCardStats = await unitOfWork.StatsRepository.GetCardStatsForDeckAsync(userId, updateDto.DeckId);
        foreach (var incomingCardStat in updateDto.Cards)
        {
            var stat = existingCardStats.FirstOrDefault(cs => cs.CardId == incomingCardStat.CardId);
            if (stat == null)
            {
                stat = new CardStats
                {
                    AppUserId = userId,
                    CardId = incomingCardStat.CardId,
                };
                unitOfWork.StatsRepository.AddCardStats(stat);
            }
            
            stat.BatchIndex = incomingCardStat.BatchIndex;
            stat.RotationPoints = incomingCardStat.RotationPoints;
            stat.IsMastered = incomingCardStat.IsMastered;
        }

        return await unitOfWork.Complete();
    }
}
