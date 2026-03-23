using System;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public async Task<AppUser?> GetUserByIdAsync(string id)
    {
        return await context.Users.FindAsync(id);
    }

    public async Task<AppUser?> GetUserForUpdate(string id)
    {
        return await context.Users
            // .IgnoreQueryFilters() //Only needed if we have soft delete
            .SingleOrDefaultAsync(x => x.Id == id);
    }

    public async Task<IEnumerable<AppUser>?> GetUsersAsync()
    {
        return await context.Users.ToListAsync();
    }

    public void Update(AppUser appUser)
    {
        context.Entry(appUser).State = EntityState.Modified;
    }
}
