// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;

namespace API.Interfaces;

public interface IUnitOfWork
{
    IUserRepository UserRepository { get; }
    IDecksRepository DecksRepository { get; }
    ICardsRepository CardsRepository { get; }
    IStatsRepository StatsRepository { get; }
    Task<bool> Complete();
    bool HasChanges();
}

