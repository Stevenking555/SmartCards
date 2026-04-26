// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;
using System.Threading.Tasks;
using API.Entities;
using API.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace API.Tests.Services;

public class TokenServiceTests
{
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly AppUser _testUser;

    public TokenServiceTests()
    {
        _mockConfig = new Mock<IConfiguration>();
        _testUser = new AppUser { Id = "test-id", Email = "test@test.com", UserName = "testUser", DisplayName = "Test User" };
    }

    [Fact]
    public async Task CreateToken_WhenTokenKeyIsMissing_ThrowsInvalidOperationException()
    {
        // Arrange
        _mockConfig.Setup(c => c["TokenKey"]).Returns((string?)null);
        var tokenService = new TokenService(_mockConfig.Object);

        // Act
        Func<Task> action = async () => await tokenService.CreateToken(_testUser);

        // Assert
        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Cannot get token key");
    }

    [Fact]
    public async Task CreateToken_WhenTokenKeyIsTooShort_ThrowsInvalidOperationException()
    {
        // Arrange
        _mockConfig.Setup(c => c["TokenKey"]).Returns("too-short-key");
        var tokenService = new TokenService(_mockConfig.Object);

        // Act
        Func<Task> action = async () => await tokenService.CreateToken(_testUser);

        // Assert
        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Your token key needs to be >= 64 characters");
    }

    [Fact]
    public async Task CreateToken_WithValidKey_ReturnsTokenString()
    {
        // Arrange
        var validKey = new string('a', 64); // 64 valid characters
        _mockConfig.Setup(c => c["TokenKey"]).Returns(validKey);
        var tokenService = new TokenService(_mockConfig.Object);

        // Act
        var result = await tokenService.CreateToken(_testUser);

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Split('.').Length.Should().Be(3); // A valid JWT has 3 parts separated by dots
    }
}
