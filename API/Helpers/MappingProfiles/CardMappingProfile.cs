// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.Helpers.MappingProfiles;

public class CardMappingProfile : Profile
{
    public CardMappingProfile()
    {
        CreateMap<CreateCardDto, Card>();
        CreateMap<Card, CardDto>().ReverseMap();
        CreateMap<Card, CardWithStatsDto>()
            .ForMember(dest => dest.Card, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.CardStats, opt => opt.MapFrom(src => src.CardStats.FirstOrDefault()));

        CreateMap<CardStats, CardStatsDto>();
    }
}


