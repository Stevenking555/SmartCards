using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class CreateDeckDto
{
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    [Required]
    public string Goal { get; set; } = "weeks";
}
