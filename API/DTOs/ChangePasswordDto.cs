using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ChangePasswordDto
{
    [Required]
    [DataType(DataType.Password)]
    public required string OldPassword { get; set; }

    [Required]
    [StringLength(32, MinimumLength = 6, ErrorMessage = "A jelszónak legalább 6 karakter hosszúvnak kell lennie.")]
    [DataType(DataType.Password)]
    public required string NewPassword { get; set; }
}