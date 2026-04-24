// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class UpdateEmailDto
{
    [Required]
    [EmailAddress(ErrorMessage = "Ă‰rvĂ©nytelen e-mail formĂˇtum.")]
    public required string NewEmail { get; set; }

    [Required]
    [DataType(DataType.Password)]
    public required string CurrentPassword { get; set; }
}

