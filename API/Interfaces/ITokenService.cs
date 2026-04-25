// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using API.Entities;

namespace API.Interfaces;

public interface ITokenService
{
    Task<string> CreateToken(AppUser user);
    string GenerateRefreshToken();
}

