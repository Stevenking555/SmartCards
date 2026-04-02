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
    public async Task<DeckPageStatsDto> GetDeckPageStatsAsync(string userId, Guid deckId)
    {
        var deckStats = await unitOfWork.StatsRepository.GetDeckStatsAsync(userId, deckId);
        if (deckStats == null) return new DeckPageStatsDto();

        return mapper.Map<DeckPageStatsDto>(deckStats);
    }

    public async Task<IEnumerable<GameCardStatsDto>> GetGameCardStatsAsync(string userId, Guid deckId)
    {
        var cardStats = await unitOfWork.StatsRepository.GetCardStatsForDeckAsync(userId, deckId);
        return mapper.Map<IEnumerable<GameCardStatsDto>>(cardStats);
    }

    public async Task<HomePageStatsDto> GetHomePageStatsAsync(string userId)
    {
        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(userId);
        var lastDecks = await unitOfWork.StatsRepository.GetLastPlayedDecksAsync(userId, 5);

        var dto = new HomePageStatsDto();
        
        if (userStats != null)
        {
            mapper.Map(userStats, dto);
        }

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
            if (userStats.LearningStreak > userStats.LongestStreak)
                userStats.LongestStreak = userStats.LearningStreak;
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
