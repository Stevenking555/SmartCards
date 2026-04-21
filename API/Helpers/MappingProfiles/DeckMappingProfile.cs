using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.Helpers.MappingProfiles;

public class DeckMappingProfile : Profile
{
    public DeckMappingProfile()
    {
        CreateMap<CreateDeckDto, Deck>();
        CreateMap<Deck, DeckDto>();
        CreateMap<Deck, DeckWithStatsDto>()
            .ForMember(dest => dest.Deck, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.DeckStats, opt => opt.MapFrom(src => src.DeckStats.FirstOrDefault()));
            
        CreateMap<Deck, DeckWithCardsDto>()
            .ForMember(dest => dest.Deck, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.Cards, opt => opt.MapFrom(src => src.Cards))
            .ForMember(dest => dest.Stats, opt => opt.MapFrom(src => src.DeckStats.FirstOrDefault()));
            
        CreateMap<Deck, DeckForGameDto>()
            .ForMember(dest => dest.Deck, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.DeckStats, opt => opt.MapFrom(src => src.DeckStats.FirstOrDefault()))
            .ForMember(dest => dest.Cards, opt => opt.MapFrom(src => src.Cards));

        CreateMap<DeckStats, DeckStatsDto>();
    }
}
