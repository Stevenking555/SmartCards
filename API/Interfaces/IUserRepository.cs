using System;
using API.Entities;

namespace API.Interfaces;

public interface IUserRepository
{
    void Update(AppUser AppUser);
    Task<IEnumerable<AppUser>?> GetUsersAsync();
    Task<AppUser?> GetUserByIdAsync(string id);
    Task<AppUser?> GetUserForUpdate(string id);
}
