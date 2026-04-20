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
            userStats = new UserStats { AppUserId = userId };
            unitOfWork.StatsRepository.AddUserStats(userStats);
        }

        // Check daily streak
        var lastFlipDate = userStats.LastFlipAt.Date;
        var today = DateTime.UtcNow.Date;
        var daysSinceLastFlip = (today - lastFlipDate).Days;
        
        bool modified = false;

        // If user logged in today, do nothing. If yesterday, keep streak. 
        // But if more than 1 day has passed, streak is broken. We reset it to 0. 
        if (daysSinceLastFlip > 1 && userStats.LearningStreak > 0)
        {
            userStats.LearningStreak = 0;
            modified = true;
        }

        // Reset daily flips if it's a new day
        if (daysSinceLastFlip >= 1 && userStats.FlippedCardsToday > 0)
        {
            userStats.FlippedCardsToday = 0;
            modified = true;
        }

        if (modified)
        {
            await unitOfWork.Complete();
        }

        // Map simple fields from entity to DTO
        var dto = mapper.Map<UserStatsDto>(userStats);

        return dto;
    }

    public async Task<StudySessionResultDto?> SaveStudySessionAsync(string userId, UpdateSessionStatsDto updateDto)
    {
        // 1. Update UserStats
        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(userId);
        if (userStats == null)
        {
            userStats = new UserStats { AppUserId = userId, LastFlipAt = updateDto.LastFlipAt };
            unitOfWork.StatsRepository.AddUserStats(userStats);
        }

        var daysSinceLastFlip = (updateDto.LastFlipAt.Date - userStats.LastFlipAt.Date).Days;

        if (daysSinceLastFlip >= 1)
        {
            // New calendar day, reset the daily counter before adding new flips
            userStats.FlippedCardsToday = 0;
            
            // Streak logic
            if (daysSinceLastFlip == 1)
            {
                userStats.LearningStreak++;
            }
            else
            {
                userStats.LearningStreak = 1;
            }
        }
        else if (userStats.LearningStreak == 0)
        {
            // First time ever or recovered from 0
            userStats.LearningStreak = 1;
        }

        userStats.FlippedCardsTotal += updateDto.FlippedCardsTotal;
        userStats.FlippedCardsToday += updateDto.FlippedCardsToday;
        userStats.LastFlipAt = updateDto.LastFlipAt;

        // 2. Fetch/Create DeckStats first to calculate the delta for Weekly Activity
        var deckStats = await unitOfWork.StatsRepository.GetDeckStatsAsync(userId, updateDto.DeckId);
        int oldTimeSpent = deckStats?.TimeSpentMinutes ?? 0;
        
        if (deckStats == null)
        {
            deckStats = new DeckStats { AppUserId = userId, DeckId = updateDto.DeckId };
            unitOfWork.StatsRepository.AddDeckStats(deckStats);
        }

        int sessionTimeDelta = updateDto.TimeSpentMinutes; 
        if (sessionTimeDelta < 0) sessionTimeDelta = 0; // Defensive check for malformed data

        deckStats.TimeSpentMinutes += sessionTimeDelta;
        deckStats.LastPlayedAt = updateDto.LastPlayedAt;

        // Weekly Activity JSON Logic uses the calculated delta
        var weeklyActivity = string.IsNullOrEmpty(userStats.WeeklyActivityJson) 
            ? new List<int>(new int[7]) 
            : JsonSerializer.Deserialize<List<int>>(userStats.WeeklyActivityJson) ?? new List<int>(new int[7]);
        
        int dayOfWeekIndex = (int)DateTime.UtcNow.DayOfWeek;
        weeklyActivity[dayOfWeekIndex] += sessionTimeDelta;
        userStats.WeeklyActivityJson = JsonSerializer.Serialize(weeklyActivity);

        int netMasteredChange = 0;

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
            stat.RotationIndex = incomingCardStat.RotationIndex;

            if (stat.IsMastered != incomingCardStat.IsMastered)
            {
                netMasteredChange += incomingCardStat.IsMastered ? 1 : -1;
                stat.IsMastered = incomingCardStat.IsMastered;
            }
        }

        userStats.TotalMasteredCards += netMasteredChange;

        // Knowledge percentage calculation (Mastered / Total)
        // Computed in-memory using the already-fetched card stats + applied changes
        // to avoid reading stale data from the DB before Complete() is called.
        var totalCards = await unitOfWork.CardsRepository.GetCardCountForDeckAsync(updateDto.DeckId);
        if (totalCards > 0)
        {
            // Count mastered from the in-memory collection (already updated above)
            var masteredInDeck = existingCardStats.Count(cs => cs.IsMastered);
            deckStats.KnowledgePercentage = (int)Math.Round((double)masteredInDeck / totalCards * 100);
        }

        if (await unitOfWork.Complete())
        {
            return new StudySessionResultDto
            {
                UserStats = mapper.Map<UserStatsDto>(userStats),
                UpdatedDeckStats = mapper.Map<DeckStatsDto>(deckStats)
            };
        }

        return null;
    }
}
