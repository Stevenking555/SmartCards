using Microsoft.EntityFrameworkCore;
using SmartCards.API.Models;

namespace SmartCards.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Deck> Decks { get; set; }
        public DbSet<FlashCard> Flashcards { get; set; }
    }
}
