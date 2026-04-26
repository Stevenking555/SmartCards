// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ImportCardsDto
{
    [Required]
    public string BulkText { get; set; } = string.Empty;
}

