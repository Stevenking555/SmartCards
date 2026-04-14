using System;
using System.Collections.Generic;

namespace API.DTOs;

public class SyncDecksDto
{
    public IEnumerable<CreateDeckDto> AddedDecks { get; set; } = new List<CreateDeckDto>();
    public IEnumerable<UpdateDeckDto> UpdatedDecks { get; set; } = new List<UpdateDeckDto>();
    public IEnumerable<Guid> DeletedDeckIds { get; set; } = new List<Guid>();
}

public class UpdateDeckDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Goal { get; set; } = null!;
}
