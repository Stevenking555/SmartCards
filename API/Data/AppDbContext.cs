// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data;

public class AppDbContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Deck> Decks { get; set; }
    public DbSet<Card> Cards { get; set; }
    public DbSet<UserStats> UserStats { get; set; }
    public DbSet<DeckStats> DeckStats { get; set; }
    public DbSet<CardStats> CardStats { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // AppUser -> Deck
        modelBuilder.Entity<Deck>()
            .HasOne(d => d.AppUser)
            .WithMany(u => u.Decks)
            .HasForeignKey(d => d.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Deck -> Card
        modelBuilder.Entity<Card>()
            .HasOne(c => c.Deck)
            .WithMany(d => d.Cards)
            .HasForeignKey(c => c.DeckId)
            .OnDelete(DeleteBehavior.Cascade);

        // AppUser -> UserStats
        modelBuilder.Entity<UserStats>()
            .HasKey(us => us.AppUserId);

        modelBuilder.Entity<UserStats>()
            .HasOne(us => us.AppUser)
            .WithOne(u => u.UserStats)
            .HasForeignKey<UserStats>(us => us.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        // AppUser -> DeckStats
        modelBuilder.Entity<DeckStats>()
            .HasOne(ds => ds.AppUser)
            .WithMany(u => u.DeckStats)
            .HasForeignKey(ds => ds.AppUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Deck -> DeckStats
        modelBuilder.Entity<DeckStats>()
            .HasOne(ds => ds.Deck)
            .WithMany(d => d.DeckStats)
            .HasForeignKey(ds => ds.DeckId)
            .OnDelete(DeleteBehavior.Cascade);

        // AppUser -> CardStats
        modelBuilder.Entity<CardStats>()
            .HasOne(cs => cs.AppUser)
            .WithMany(u => u.CardStats)
            .HasForeignKey(cs => cs.AppUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Card -> CardStats
        modelBuilder.Entity<CardStats>()
            .HasOne(cs => cs.Card)
            .WithMany(c => c.CardStats)
            .HasForeignKey(cs => cs.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
        );

        var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? v.Value.ToUniversalTime() : null,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null
        );

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
                }
                else if (property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(nullableDateTimeConverter);
                }
            }
        }
    }
}
