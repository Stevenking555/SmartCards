// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ChangePasswordDto
{
    [Required]
    [DataType(DataType.Password)]
    public required string OldPassword { get; set; }

    [Required]
    [StringLength(32, MinimumLength = 6, ErrorMessage = "A jelszĂłnak legalĂˇbb 6 karakter hosszĂşvnak kell lennie.")]
    [DataType(DataType.Password)]
    public required string NewPassword { get; set; }
}
