using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<Deck, DeckDto>();
        CreateMap<CreateDeckDto, Deck>();
        
        CreateMap<Card, CardDto>();
        CreateMap<CreateCardDto, Card>();

        CreateMap<AppUser, UserDto>()
            .ForMember(dest => dest.Token, opt => opt.Ignore());

        CreateMap<UserStats, HomePageStatsDto>();
        
        CreateMap<DeckStats, DeckPageStatsDto>();
        
        CreateMap<CardStats, GameCardStatsDto>();

        CreateMap<Deck, DeckWithStatsDto>();
        CreateMap<Deck, DeckWithCardsDto>();
        CreateMap<Card, CardWithStatsDto>();
        CreateMap<Deck, DeckForGameDto>();
    }
}
