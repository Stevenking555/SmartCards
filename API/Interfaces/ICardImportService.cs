// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;
using System.Threading.Tasks;
using API.DTOs;

namespace API.Interfaces;

public interface ICardImportService
{
    Task<ImportResultDto> ImportCardsAsync(Guid deckId, string userId, string bulkText);
}

