using SmartCards.API.Models;
using System.Xml.Linq;

namespace SmartCards.API.Services
{
    public class RoleService
    {
        static List<Role> roles = new List<Role>();

        static RoleService()
        {
            roles = new List<Role>
            {
                new Role { Id = 1, Name = "Role" },
                new Role { Id = 2, Name = "admin" }
            };
        }

        public static List<Role> GetAll()
        {
            return roles;
        }

        public static Role? Get(int id)
        {
            return roles.FirstOrDefault(x => x.Id == id);
        }

        public static void Add(Role Role)
        {
            roles.Add(Role);
        }

        public static void Update(Role Role)
        {
            for (int i = 0; i < roles.Count; i++)
            {
                if (roles[i].Id == Role.Id)
                {
                    roles[i] = Role;
                    return;
                }
            }
        }

        public static void Delete(int id)
        {
            var Role = Get(id);
            if (Role != null)
            {
                roles.Remove(Role);
            }
        }
    }
}
