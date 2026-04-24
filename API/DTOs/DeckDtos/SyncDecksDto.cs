// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;
using System.Collections.Generic;

namespace API.DTOs;

public class SyncDecksDto
{
    public List<CreateDeckDto> AddedDecks { get; set; } = new();
    public List<DeckDto> UpdatedDecks { get; set; } = new();
    public List<Guid> DeletedDeckIds { get; set; } = new();
}

