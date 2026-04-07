using System;

namespace API.DTOs;

public class UserUpdateDto
{
    public string? DisplayName { get; set; }
    public string? CurrentPassword { get; set; }
}
