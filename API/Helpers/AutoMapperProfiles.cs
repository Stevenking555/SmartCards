using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<CreateDeckDto, Deck>();
        CreateMap<Deck, DeckDto>();
        CreateMap<Deck, DeckWithStatsDto>();
        CreateMap<Deck, DeckWithCardsDto>();
        CreateMap<Deck, DeckForGameDto>();
        
        CreateMap<CreateCardDto, Card>();
        CreateMap<Card, CardDto>();
        CreateMap<Card, CardWithStatsDto>();

        CreateMap<AppUser, UserDto>()
            .ForMember(dest => dest.Token, opt => opt.Ignore());

        CreateMap<UserStats, UserStatsDto>();
        
        CreateMap<DeckStats, DeckStatsDto>();
        
        CreateMap<CardStats, CardStatsDto>();
    }
}
