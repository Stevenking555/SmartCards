using System;
using System.Collections.Generic;

namespace API.DTOs;

public class DeckWithCardsDto
{
    public DeckDto Deck { get; set; } = new DeckDto();
    
    public IEnumerable<CardDto> Cards { get; set; } = new List<CardDto>();
}