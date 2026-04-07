using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class UpdateEmailDto
{
    [Required]
    [EmailAddress(ErrorMessage = "Érvénytelen e-mail formátum.")]
    public required string NewEmail { get; set; }

    [Required]
    [DataType(DataType.Password)]
    public required string CurrentPassword { get; set; }
}
