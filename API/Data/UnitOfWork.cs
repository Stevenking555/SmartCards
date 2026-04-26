// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    private IUserRepository? _userRepository;
    private IDecksRepository? _decksRepository;
    private ICardsRepository? _cardsRepository;
    private IStatsRepository? _statsRepository;

    public IUserRepository UserRepository => _userRepository 
        ??= new UserRepository(context);
        
    public IDecksRepository DecksRepository => _decksRepository 
        ??= new DecksRepository(context);
        
    public ICardsRepository CardsRepository => _cardsRepository 
        ??= new CardsRepository(context);
        
    public IStatsRepository StatsRepository => _statsRepository 
        ??= new StatsRepository(context);

    public async Task<bool> Complete()
    {
        try
        {
            return await context.SaveChangesAsync() > 0;
        }
        catch (DbUpdateException ex)
        {
            throw new InvalidOperationException("An error occured while saving changes", ex);
        }
    }

    public bool HasChanges()
    {
        return context.ChangeTracker.HasChanges();
    }
}

