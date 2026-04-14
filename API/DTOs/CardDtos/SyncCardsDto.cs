using System;
using System.Collections.Generic;

namespace API.DTOs;

public class SyncCardsDto
{
    public IEnumerable<CreateCardDto> AddedCards { get; set; } = new List<CreateCardDto>();
    public IEnumerable<UpdateCardDto> UpdatedCards { get; set; } = new List<UpdateCardDto>();
    public IEnumerable<Guid> DeletedCardIds { get; set; } = new List<Guid>();
}

public class UpdateCardDto
{
    public Guid Id { get; set; }
    public string Question { get; set; } = null!;
    public string Answer { get; set; } = null!;
}
