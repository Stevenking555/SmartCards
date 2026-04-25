// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System.Collections.Generic;
using System.Threading.Tasks;
using API.Entities;

namespace API.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<AppUser>> GetUsersAsync();
    Task<AppUser?> GetUserByIdAsync(string id);
}

