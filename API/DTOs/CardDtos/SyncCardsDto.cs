using System;
using System.Collections.Generic;

namespace API.DTOs;

public class SyncCardsDto
{
    public List<CreateCardDto> AddedCards { get; set; } = new();
    public List<CardDto> UpdatedCards { get; set; } = new();
    public List<Guid> DeletedCardIds { get; set; } = new();
}
