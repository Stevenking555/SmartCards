// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
namespace API.Entities;
using Microsoft.AspNetCore.Identity;

public class AppUser : IdentityUser
{
    public required string DisplayName { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    public DateTime Created { get; set; } = DateTime.UtcNow;

    public ICollection<Deck> Decks { get; set; } = new List<Deck>();
    public UserStats? UserStats { get; set; }
    public ICollection<DeckStats> DeckStats { get; set; } = new List<DeckStats>();
    public ICollection<CardStats> CardStats { get; set; } = new List<CardStats>();
}
