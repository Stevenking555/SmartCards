// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using API.DTOs;
using API.Entities;
using API.Interfaces;
using API.Services;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace API.Tests.Services;

public class StatsServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IMapper> _mockMapper;
    private readonly StatsService _statsService;

    public StatsServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockMapper = new Mock<IMapper>();

        // Set up default successful completion
        _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(true);

        _statsService = new StatsService(_mockUnitOfWork.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task GetUserStatsAsync_WhenMoreThan7DaysPassed_ResetsWeeklyActivityAndStreak()
    {
        // Arrange
        var userId = "test-user-id";
        var today = DateTime.Now.Date;
        var pastDate = today.AddDays(-8); // More than 7 days ago

        var userStats = new UserStats
        {
            AppUserId = userId,
            LastFlipAt = pastDate,
            LearningStreak = 5,
            FlippedCardsToday = 20,
            WeeklyActivityJson = "[10,20,30,40,50,60,70]"
        };

        _mockUnitOfWork.Setup(u => u.StatsRepository.GetUserStatsAsync(userId))
            .ReturnsAsync(userStats);

        _mockMapper.Setup(m => m.Map<UserStatsDto>(It.IsAny<UserStats>()))
            .Returns((UserStats source) => new UserStatsDto 
            { 
                FlippedCardsToday = source.FlippedCardsToday,
                LearningStreak = source.LearningStreak
            });

        // Act
        var result = await _statsService.GetUserStatsAsync(userId);

        // Assert
        result.LearningStreak.Should().Be(0); // Streak should break
        result.FlippedCardsToday.Should().Be(0); // Daily count should reset
        userStats.WeeklyActivityJson.Should().Be("[0,0,0,0,0,0,0]"); // JSON should reflect [0,0,0,0,0,0,0]
        _mockUnitOfWork.Verify(u => u.Complete(), Times.Once); // Ensure changes were saved
    }

    [Fact]
    public async Task GetUserStatsAsync_WhenExactlyOneDayPassed_IncreasesStreak()
    {
        // Arrange
        var userId = "test-user-id";
        var today = DateTime.Now.Date;
        var yesterday = today.AddDays(-1);

        var userStats = new UserStats
        {
            AppUserId = userId,
            LastFlipAt = yesterday,
            LearningStreak = 5,
            FlippedCardsToday = 20
        };

        _mockUnitOfWork.Setup(u => u.StatsRepository.GetUserStatsAsync(userId))
            .ReturnsAsync(userStats);

        _mockMapper.Setup(m => m.Map<UserStatsDto>(It.IsAny<UserStats>()))
            .Returns((UserStats source) => new UserStatsDto 
            { 
                LearningStreak = source.LearningStreak
            });

        // Act
        var result = await _statsService.GetUserStatsAsync(userId);

        // Assert
        result.LearningStreak.Should().Be(6); // Streak should increment by 1
        _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
    }

    // ---------------------------------------------------------------
    // RecalculateDeckKnowledgeAsync
    // ---------------------------------------------------------------

    [Fact]
    public async Task RecalculateDeckKnowledgeAsync_SetsCorrectPercentage_WhenSomeMastered()
    {
        // Arrange
        var userId = "test-user-id";
        var deckId = Guid.NewGuid();

        var deckStats = new DeckStats { AppUserId = userId, DeckId = deckId, KnowledgePercentage = 0 };

        var cardStats = new List<CardStats>
        {
            new() { AppUserId = userId, CardId = Guid.NewGuid(), IsMastered = true  },
            new() { AppUserId = userId, CardId = Guid.NewGuid(), IsMastered = true  },
            new() { AppUserId = userId, CardId = Guid.NewGuid(), IsMastered = false },
            new() { AppUserId = userId, CardId = Guid.NewGuid(), IsMastered = false },
        };

        _mockUnitOfWork.Setup(u => u.StatsRepository.GetDeckStatsAsync(userId, deckId))
            .ReturnsAsync(deckStats);
        _mockUnitOfWork.Setup(u => u.StatsRepository.GetCardStatsForDeckAsync(userId, deckId))
            .ReturnsAsync(cardStats);
        _mockUnitOfWork.Setup(u => u.CardsRepository.GetCardCountForDeckAsync(deckId))
            .ReturnsAsync(4);

        // Act
        await _statsService.RecalculateDeckKnowledgeAsync(userId, deckId);

        // Assert — 2 out of 4 = 50%
        deckStats.KnowledgePercentage.Should().Be(50);
        _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
    }

    [Fact]
    public async Task RecalculateDeckKnowledgeAsync_SetsZero_WhenNoDeckStatsExist()
    {
        // Arrange
        var userId = "test-user-id";
        var deckId = Guid.NewGuid();

        _mockUnitOfWork.Setup(u => u.StatsRepository.GetDeckStatsAsync(userId, deckId))
            .ReturnsAsync((DeckStats?)null);

        // Act — should return early without throwing or saving
        await _statsService.RecalculateDeckKnowledgeAsync(userId, deckId);

        // Assert — Complete() must NOT be called because we returned early
        _mockUnitOfWork.Verify(u => u.Complete(), Times.Never);
    }

    // ---------------------------------------------------------------
    // SaveStudySessionAsync
    // ---------------------------------------------------------------

    [Fact]
    public async Task SaveStudySessionAsync_IncreasesDeckTimeSpentAndTodayColumn()
    {
        // Arrange
        var userId = "test-user-id";
        var deckId  = Guid.NewGuid();
        var today   = DateTime.Now;

        // Today's index in the weekly array (Mon=0 … Sun=6)
        int todayIndex = today.DayOfWeek == DayOfWeek.Sunday ? 6 : (int)today.DayOfWeek - 1;

        // LastFlipAt is also today → no reset, just accumulate
        var userStats = new UserStats
        {
            AppUserId        = userId,
            LastFlipAt       = today,
            FlippedCardsToday = 0,
            FlippedCardsTotal = 0,
            LearningStreak   = 3,
            WeeklyActivityJson = "[5,0,0,0,0,0,0]"  // Mon already has 5 minutes
        };

        var deckStats = new DeckStats { AppUserId = userId, DeckId = deckId, TimeSpentMinutes = 10 };

        var updateDto = new UpdateSessionStatsDto
        {
            DeckId            = deckId,
            TimeSpentMinutes  = 20,   // play 20 minutes this session
            FlippedCardsTotal = 5,
            FlippedCardsToday = 5,
            LastFlipAt        = today,
            LastPlayedAt      = today,
            Cards             = []
        };

        _mockUnitOfWork.Setup(u => u.StatsRepository.GetUserStatsAsync(userId)).ReturnsAsync(userStats);
        _mockUnitOfWork.Setup(u => u.StatsRepository.GetDeckStatsAsync(userId, deckId)).ReturnsAsync(deckStats);
        _mockUnitOfWork.Setup(u => u.StatsRepository.GetCardStatsForDeckAsync(userId, deckId))
            .ReturnsAsync(new List<CardStats>());
        _mockUnitOfWork.Setup(u => u.CardsRepository.GetCardCountForDeckAsync(deckId)).ReturnsAsync(0);
        _mockMapper.Setup(m => m.Map<UserStatsDto>(It.IsAny<UserStats>())).Returns(new UserStatsDto());
        _mockMapper.Setup(m => m.Map<DeckStatsDto>(It.IsAny<DeckStats>())).Returns(new DeckStatsDto());

        // Act
        var result = await _statsService.SaveStudySessionAsync(userId, updateDto);

        // Assert — deck time goes from 10 → 30
        deckStats.TimeSpentMinutes.Should().Be(30);

        // Today's column in the weekly array should now have +20 minutes
        var weekly = System.Text.Json.JsonSerializer.Deserialize<List<int>>(userStats.WeeklyActivityJson)!;
        weekly[todayIndex].Should().BeGreaterThan(0);
        weekly[todayIndex].Should().Be(
            todayIndex == 0 ? 5 + 20 : 20,   // if today is Monday, the existing 5 + 20; otherwise the 5 stayed at index 0
            "the session time must be added to today's column");

        result.Should().NotBeNull();
        _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
    }

    [Fact]
    public async Task SaveStudySessionAsync_ClearsIntermediateDays_WhenLastSessionWasMultipleDaysAgo()
    {
        // Arrange — simulate: last session was 4 days ago, all columns had data
        var userId  = "test-user-id";
        var deckId  = Guid.NewGuid();
        var today   = DateTime.Now;
        var fourDaysAgo = today.AddDays(-4);

        int todayIndex = today.DayOfWeek == DayOfWeek.Sunday ? 6 : (int)today.DayOfWeek - 1;

        var userStats = new UserStats
        {
            AppUserId          = userId,
            LastFlipAt         = fourDaysAgo,
            FlippedCardsToday  = 10,
            FlippedCardsTotal  = 100,
            LearningStreak     = 7,
            WeeklyActivityJson = "[10,10,10,10,10,10,10]"  // every day had 10 minutes
        };

        var deckStats = new DeckStats { AppUserId = userId, DeckId = deckId };

        var updateDto = new UpdateSessionStatsDto
        {
            DeckId            = deckId,
            TimeSpentMinutes  = 15,
            FlippedCardsTotal = 3,
            FlippedCardsToday = 3,
            LastFlipAt        = today,
            LastPlayedAt      = today,
            Cards             = []
        };

        _mockUnitOfWork.Setup(u => u.StatsRepository.GetUserStatsAsync(userId)).ReturnsAsync(userStats);
        _mockUnitOfWork.Setup(u => u.StatsRepository.GetDeckStatsAsync(userId, deckId)).ReturnsAsync(deckStats);
        _mockUnitOfWork.Setup(u => u.StatsRepository.GetCardStatsForDeckAsync(userId, deckId))
            .ReturnsAsync(new List<CardStats>());
        _mockUnitOfWork.Setup(u => u.CardsRepository.GetCardCountForDeckAsync(deckId)).ReturnsAsync(0);
        _mockMapper.Setup(m => m.Map<UserStatsDto>(It.IsAny<UserStats>())).Returns(new UserStatsDto());
        _mockMapper.Setup(m => m.Map<DeckStatsDto>(It.IsAny<DeckStats>())).Returns(new DeckStatsDto());

        // Act
        await _statsService.SaveStudySessionAsync(userId, updateDto);

        // Assert
        var weekly = System.Text.Json.JsonSerializer.Deserialize<List<int>>(userStats.WeeklyActivityJson)!;

        // Helper: converts a DateTime to the Mon=0..Sun=6 index used by the service
        int DayIdx(DateTime d) => d.DayOfWeek == DayOfWeek.Sunday ? 6 : (int)d.DayOfWeek - 1;

        // The service clears i=0..daysPassed-1 → that is today, today-1, today-2, today-3
        // Then it adds session time to today's slot.
        // So the three slots that must be 0 are yesterday, 2-days-ago, 3-days-ago.
        int idxYesterday   = DayIdx(today.AddDays(-1));
        int idxTwoDaysAgo  = DayIdx(today.AddDays(-2));
        int idxThreeDaysAgo = DayIdx(today.AddDays(-3));

        // Today's column must have the new session time (was cleared then +15 added)
        weekly[todayIndex].Should().Be(15, "today's column must contain only the current session time");

        // The 3 days between fourDaysAgo and today must be exactly 0
        weekly[idxYesterday].Should().Be(0, "yesterday was not played — must be cleared to 0");
        weekly[idxTwoDaysAgo].Should().Be(0, "2 days ago was not played — must be cleared to 0");
        weekly[idxThreeDaysAgo].Should().Be(0, "3 days ago was not played — must be cleared to 0");

        // The remaining 3 columns (fourDaysAgo itself, 5 days ago, 6 days ago) were NOT
        // in the cleared range → they must still hold their original value of 10
        int idxFourDaysAgo  = DayIdx(today.AddDays(-4));
        int idxFiveDaysAgo  = DayIdx(today.AddDays(-5));
        int idxSixDaysAgo   = DayIdx(today.AddDays(-6));

        weekly[idxFourDaysAgo].Should().Be(10,
            "fourDaysAgo is the lastFlipAt date itself — the service does NOT clear it, so it keeps the old value");
        weekly[idxFiveDaysAgo].Should().Be(10,
            "5 days ago was not in the cleared range — old value must be preserved");
        weekly[idxSixDaysAgo].Should().Be(10,
            "6 days ago was not in the cleared range — old value must be preserved");

        // Streak resets to 1 when more than 1 day has passed
        userStats.LearningStreak.Should().Be(1, "streak must reset to 1 when more than one day passes");
    }
}
