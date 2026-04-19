using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class CreateCardDto
{
    [Required]
    public string Question { get; set; } = null!;

    [Required]
    public string Answer { get; set; } = null!;
}
