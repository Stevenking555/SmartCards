// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.Helpers.MappingProfiles;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<AppUser, UserDto>()
            .ForMember(dest => dest.Token, opt => opt.Ignore());

        CreateMap<UserStats, UserStatsDto>();
    }
}

