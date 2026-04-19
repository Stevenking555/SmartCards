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
        CreateMap<Deck, DeckWithStatsDto>()
            .ForMember(dest => dest.Deck, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.DeckStats, opt => opt.MapFrom(src => src.DeckStats.FirstOrDefault()));
            
        CreateMap<Deck, DeckWithCardsDto>()
            .ForMember(dest => dest.Deck, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.Cards, opt => opt.MapFrom(src => src.Cards));
            
        CreateMap<Deck, DeckForGameDto>()
            .ForMember(dest => dest.Deck, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.DeckStats, opt => opt.MapFrom(src => src.DeckStats.FirstOrDefault()))
            .ForMember(dest => dest.Cards, opt => opt.MapFrom(src => src.Cards));
        
        CreateMap<CreateCardDto, Card>();
        CreateMap<Card, CardDto>();
        CreateMap<Card, CardWithStatsDto>()
            .ForMember(dest => dest.Card, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.CardStats, opt => opt.MapFrom(src => src.CardStats.FirstOrDefault()));

        CreateMap<AppUser, UserDto>()
            .ForMember(dest => dest.Token, opt => opt.Ignore());

        CreateMap<UserStats, UserStatsDto>();
        
        CreateMap<DeckStats, DeckStatsDto>();
        
        CreateMap<CardStats, CardStatsDto>();
    }
}
