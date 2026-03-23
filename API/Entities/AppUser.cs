namespace API.Entities;
using Microsoft.AspNetCore.Identity;

public class AppUser : IdentityUser
{
    public required string DisplayName { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    public DateTime Created { get; set; } = DateTime.UtcNow;
}