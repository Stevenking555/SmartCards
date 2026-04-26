// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
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

        // Rolling Reset Logic for Weekly Activity
        var lastFlipDate = userStats.LastFlipAt.Date;
        var today = DateTime.Now.Date;
        
        var weeklyActivity = string.IsNullOrEmpty(userStats.WeeklyActivityJson) 
            ? new List<int>(new int[7]) 
            : JsonSerializer.Deserialize<List<int>>(userStats.WeeklyActivityJson) ?? new List<int>(new int[7]);

        bool modified = false;

        if (today > lastFlipDate)
        {
            var daysPassed = (today - lastFlipDate).Days;
            if (daysPassed >= 7)
            {
                weeklyActivity = new List<int>(new int[7]);
            }
            else
            {
                for (int i = 0; i < daysPassed; i++) 
                {
                    DateTime pastDate = today.AddDays(-i);
                    int idxToClear = pastDate.DayOfWeek == DayOfWeek.Sunday ? 6 : (int)pastDate.DayOfWeek - 1;
                    weeklyActivity[idxToClear] = 0;
                }
            }
            userStats.WeeklyActivityJson = JsonSerializer.Serialize(weeklyActivity);
            
            // Reset daily counters
            userStats.FlippedCardsToday = 0;
            if (daysPassed > 1) userStats.LearningStreak = 0; 
            
            modified = true;
        }

        if (modified)
        {
            await unitOfWork.Complete();
        }

        return mapper.Map<UserStatsDto>(userStats);
    }

    public async Task<StudySessionResultDto?> SaveStudySessionAsync(string userId, UpdateSessionStatsDto updateDto)
    {
        var userStats = await unitOfWork.StatsRepository.GetUserStatsAsync(userId);
        if (userStats == null)
        {
            userStats = new UserStats { AppUserId = userId, LastFlipAt = updateDto.LastFlipAt };
            unitOfWork.StatsRepository.AddUserStats(userStats);
        }

        var deckStats = await unitOfWork.StatsRepository.GetDeckStatsAsync(userId, updateDto.DeckId);
        if (deckStats == null)
        {
            deckStats = new DeckStats { AppUserId = userId, DeckId = updateDto.DeckId };
            unitOfWork.StatsRepository.AddDeckStats(deckStats);
        }

        // 1. Capture current state
        var oldLastFlipDate = userStats.LastFlipAt.Date;
        var now = DateTime.Now;
        var today = now.Date;

        // 2. Prepare Weekly Activity
        var weeklyActivity = string.IsNullOrEmpty(userStats.WeeklyActivityJson) 
            ? new List<int>(new int[7]) 
            : JsonSerializer.Deserialize<List<int>>(userStats.WeeklyActivityJson) ?? new List<int>(new int[7]);

        // 3. Handle Daily/Weekly Reset
        if (today > oldLastFlipDate)
        {
            var daysPassed = (today - oldLastFlipDate).Days;
            if (daysPassed >= 7)
            {
                weeklyActivity = new List<int>(new int[7]);
            }
            else
            {
                for (int i = 0; i < daysPassed; i++) 
                {
                    int idxToClear = now.AddDays(-i).DayOfWeek == DayOfWeek.Sunday ? 6 : (int)now.AddDays(-i).DayOfWeek - 1;
                    weeklyActivity[idxToClear] = 0;
                }
            }
            userStats.FlippedCardsToday = 0;
            userStats.LearningStreak = (daysPassed == 1) ? userStats.LearningStreak + 1 : 1;
        }
        else if (userStats.LearningStreak == 0)
        {
            userStats.LearningStreak = 1;
        }

        // 4. Update core stats
        userStats.FlippedCardsTotal += updateDto.FlippedCardsTotal;
        userStats.FlippedCardsToday += updateDto.FlippedCardsToday;
        userStats.LastFlipAt = updateDto.LastFlipAt;

        int sessionTimeDelta = Math.Max(0, updateDto.TimeSpentMinutes); 
        deckStats.TimeSpentMinutes += sessionTimeDelta;
        deckStats.LastPlayedAt = updateDto.LastPlayedAt;

        // 5. Update Weekly Activity
        int dayIndex = now.DayOfWeek == DayOfWeek.Sunday ? 6 : (int)now.DayOfWeek - 1;
        weeklyActivity[dayIndex] += sessionTimeDelta;
        userStats.WeeklyActivityJson = JsonSerializer.Serialize(weeklyActivity);

        // 6. Handle Cards Mastery
        int netMasteredChange = 0;
        var existingCardStats = (await unitOfWork.StatsRepository.GetCardStatsForDeckAsync(userId, updateDto.DeckId)).ToList();

        foreach (var incomingCardStat in updateDto.Cards)
        {
            var stat = existingCardStats.FirstOrDefault(cs => cs.CardId == incomingCardStat.CardId);
            if (stat == null)
            {
                stat = new CardStats { AppUserId = userId, CardId = incomingCardStat.CardId };
                unitOfWork.StatsRepository.AddCardStats(stat);
                existingCardStats.Add(stat); // Add to the list so we can count it later!
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

        var totalCards = await unitOfWork.CardsRepository.GetCardCountForDeckAsync(updateDto.DeckId);
        if (totalCards > 0)
        {
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

    public async Task RecalculateDeckKnowledgeAsync(string userId, Guid deckId)
    {
        var deckStats = await unitOfWork.StatsRepository.GetDeckStatsAsync(userId, deckId);
        if (deckStats == null) return;

        var existingCardStats = await unitOfWork.StatsRepository.GetCardStatsForDeckAsync(userId, deckId);
        var totalCards = await unitOfWork.CardsRepository.GetCardCountForDeckAsync(deckId);

        if (totalCards > 0)
        {
            var masteredInDeck = existingCardStats.Count(cs => cs.IsMastered);
            deckStats.KnowledgePercentage = (int)Math.Round((double)masteredInDeck / totalCards * 100);
        }
        else
        {
            deckStats.KnowledgePercentage = 0;
        }

        await unitOfWork.Complete();
    }
}

