using SmartCards.API.Models;
namespace SmartCards.API.Services

{
    public static class UserService
    {
        static List<User> users = new List<User>();

        static UserService()
        {
            users = new List<User>
            {
                new User { Id = 1, Username = "Pisti88", Email = "Pisti@gmail.com", RoleId = 1, CreatedAt = DateTime.Now },
                new User { Id = 2, Username = "Gabika77", Email = "Gabi@gmail.com", RoleId = 2, CreatedAt = DateTime.Now }
            };
        }
        
        public static List<User> GetAll()
        {
            return users;
        }

        public static User? Get(int id)
        {
            return users.FirstOrDefault(x => x.Id == id);
        }

        public static void Add(User User)
        {
            users.Add(User);
        }

        public static void Update(User User)
        {
            for (int i = 0; i < users.Count; i++)
            {
                if (users[i].Id == User.Id)
                {
                    users[i] = User;
                    return;
                }
            }
        }

        public static void Delete(int id)
        {
            var User = Get(id);
            if (User != null)
            {
                users.Remove(User);
            }
        }
    }
}
