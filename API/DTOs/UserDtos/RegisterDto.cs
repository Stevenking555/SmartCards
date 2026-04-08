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
    [StringLength(32, MinimumLength = 6, ErrorMessage = "A jelszónak legalább 6 karakter hosszúnak kell lennie.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = "";
}
