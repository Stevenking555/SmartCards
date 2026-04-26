// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class RegisterDto
{
    [Required]
    public string DisplayName { get; set; } = "";

    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";
    
    [Required]
    [StringLength(32, MinimumLength = 6, ErrorMessage = "The password must be at least 6 characters long.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = "";
}

