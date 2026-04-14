using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<CreateDeckDto, Deck>();
        CreateMap<Deck, DeckDto>()
            .ForMember(dest => dest.Progress, opt => opt.MapFrom(src => src.DeckStats.FirstOrDefault() != null ? src.DeckStats.FirstOrDefault()!.KnowledgePercentage : 0))
            .ForMember(dest => dest.TimeSpentMinutes, opt => opt.MapFrom(src => src.DeckStats.FirstOrDefault() != null ? src.DeckStats.FirstOrDefault()!.TimeSpentMinutes : 0));
        CreateMap<Deck, DeckWithStatsDto>()
            .ForMember(dest => dest.Deck, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.DeckStats, opt => opt.MapFrom(src => src.DeckStats.FirstOrDefault()));
            
        CreateMap<Deck, DeckWithCardsDto>()
            .ForMember(dest => dest.Deck, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.Cards, opt => opt.MapFrom(src => src.Cards));
            
        CreateMap<Deck, DeckForGameDto>()
            .ForMember(dest => dest.Deck, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.Cards, opt => opt.MapFrom(src => src.Cards));
        
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
