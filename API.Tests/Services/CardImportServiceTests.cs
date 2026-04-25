// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using API.Services;
using FluentAssertions;
using Moq;
using Xunit;

namespace API.Tests.Services;

public class CardImportServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly CardImportService _cardImportService;

    public CardImportServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        
        // Mock the repositories implicitly used by setup
        var mockCardsRepo = new Mock<ICardsRepository>();
        var mockStatsRepo = new Mock<IStatsRepository>();
        
        _mockUnitOfWork.Setup(u => u.CardsRepository).Returns(mockCardsRepo.Object);
        _mockUnitOfWork.Setup(u => u.StatsRepository).Returns(mockStatsRepo.Object);
        _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(true);

        _cardImportService = new CardImportService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task ImportCardsAsync_WithEmptyText_ReturnsUnsuccessfulResult()
    {
        // Arrange
        var deckId = Guid.NewGuid();
        var userId = "test-user";
        var bulkText = "   "; // Whitespace only

        // Act
        var result = await _cardImportService.ImportCardsAsync(deckId, userId, bulkText);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ImportedCount.Should().Be(0);
        _mockUnitOfWork.Verify(u => u.Complete(), Times.Never);
    }

    [Fact]
    public async Task ImportCardsAsync_WithInvalidFormat_ReturnsFailedLines()
    {
        // Arrange
        var deckId = Guid.NewGuid();
        var userId = "test-user";
        // One valid line, one invalid line (missing semicolon), one valid line. 
        // Entire batch should fail if one line fails.
        var bulkText = "Question 1;Answer 1\nQuestion 2 without semicolon\nQuestion 3;Answer 3"; 

        // Act
        var result = await _cardImportService.ImportCardsAsync(deckId, userId, bulkText);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.FailedLines.Should().ContainSingle();
        result.FailedLines[0].Should().Contain("Line 2:");
        _mockUnitOfWork.Verify(u => u.Complete(), Times.Never);
    }

    [Fact]
    public async Task ImportCardsAsync_WithValidFormat_SuccessfullyImportsCards()
    {
        // Arrange
        var deckId = Guid.NewGuid();
        var userId = "test-user";
        var bulkText = "Q1;A1\nQ2;A2\nQ3;A3"; 

        // Act
        var result = await _cardImportService.ImportCardsAsync(deckId, userId, bulkText);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.ImportedCount.Should().Be(3);
        result.FailedLines.Should().BeEmpty();
        _mockUnitOfWork.Verify(u => u.CardsRepository.AddCards(It.Is<IEnumerable<Card>>(c => true)), Times.Once);
        _mockUnitOfWork.Verify(u => u.StatsRepository.AddCardStatsRange(It.Is<IEnumerable<CardStats>>(c => true)), Times.Once);
        _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
    }
}
