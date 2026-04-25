// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;

namespace API.DTOs;

public class UserUpdateDto
{
    public string? DisplayName { get; set; }
    public string? CurrentPassword { get; set; }
}

