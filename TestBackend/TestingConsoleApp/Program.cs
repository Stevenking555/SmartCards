using SmartCards.API.Services;
using SmartCards.API.Models;

namespace TestingConsoleApp
{
    internal class Program
    {
        static void Main(string[] args)
        {
            bool exitApp = false;

            while (!exitApp)
            {
                Console.Clear();
                Console.ForegroundColor = ConsoleColor.Blue;
                Console.WriteLine("=== SMARTCARDS MAIN MENU ===");
                Console.ResetColor();
                Console.WriteLine("1. User Management");
                Console.WriteLine("2. Role Management");
                Console.WriteLine("3. Deck Management");
                Console.WriteLine("4. Flashcard Management");
                Console.WriteLine("-------------------------");
                Console.WriteLine("ESC. Exit Application");

                var key = Console.ReadKey(true);
                if (key.Key == ConsoleKey.Escape) exitApp = true;

                switch (key.Key)
                {
                    case ConsoleKey.D1: HandleCrudMenu("User"); break;
                    case ConsoleKey.D2: HandleCrudMenu("Role"); break;
                    case ConsoleKey.D3: HandleCrudMenu("Deck"); break;
                    case ConsoleKey.D4: HandleCrudMenu("Flashcard"); break;
                }
            }
        }

        static void HandleCrudMenu(string entityName)
        {
            bool backToMain = false;
            while (!backToMain)
            {
                Console.Clear();
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.WriteLine($"--- {entityName.ToUpper()} MANAGEMENT ---");
                Console.ResetColor();
                Console.WriteLine("1. List All");
                Console.WriteLine("2. Get by ID");
                Console.WriteLine("3. Add New");
                Console.WriteLine("4. Change UserName");
                Console.WriteLine("5. Delete");
                Console.WriteLine("-------------------------");
                Console.WriteLine("B. Back to Main Menu");

                var key = Console.ReadKey(true);
                if (key.Key == ConsoleKey.B) { backToMain = true; continue; }

                switch (key.Key)
                {
                    case ConsoleKey.D1: ExecuteList(entityName); break;
                    case ConsoleKey.D2: ExecuteGet(entityName); break;
                    case ConsoleKey.D3: ExecuteAdd(entityName); break;
                    case ConsoleKey.D4: ExecuteUpdate(entityName); break;
                    case ConsoleKey.D5: ExecuteDelete(entityName); break;
                }
                
                if (!backToMain)
                {
                    Console.WriteLine("\nPress any key to return to CRUD menu...");
                    Console.ReadKey();
                }
            }
        }

        // --- CRUD OPERATIONS ---
        static void ExecuteList(string entity)
        {
            if (entity == "User")
            {
                var list = UserService.GetAll();
                if (list == null || list.Count == 0)
                {
                    Console.WriteLine("No Users found in the system.");
                }
                else
                {
                    Console.WriteLine("\n[Listing all Users...]");
                    foreach (var u in list)
                        Console.WriteLine($"ID: {u.Id} | Name: {u.Username} | Email: {u.Email}");
                }
            }
        }

        static void ExecuteGet(string entity)
        {
            Console.Write("\nEnter ID: ");
            if (int.TryParse(Console.ReadLine(), out int id))
            {
                if (entity == "User")
                {
                    var u = UserService.Get(id);
                    if (u != null)
                    {
                        Console.WriteLine(u != null ? $"Found: {u.Username}" : "Not found!");
                    }
                    else
                    {
                        Console.WriteLine($"\n[ERROR] User with ID {id} does not exist!");
                    }
                }
            }
            else
            {
                Console.WriteLine("\nInvalid input! Please enter a number.");
            }
        }

        static void ExecuteAdd(string entity)
        {
            Console.WriteLine($"\n[Adding new {entity}]");
            if (entity == "User")
            {
                Console.Write("Username: "); string name = Console.ReadLine();
                Console.Write("Email: "); string email = Console.ReadLine();
                if(name == "" || string.IsNullOrWhiteSpace(name) || email == "" || string.IsNullOrWhiteSpace(email))
                {
                    Console.WriteLine("\nInvalid input! Please fill the blanks!");
                }
                else
                {
                    UserService.Add(new User { Id = UserService.GetAll().Count + 1, Username = name, Email = email });
                    Console.WriteLine("Added successfully!");
                }
            }
        }

        static void ExecuteUpdate(string entity)
        {
            Console.Write("\nEnter ID to update: ");
            if (int.TryParse(Console.ReadLine(), out int id))
            {
                if (entity == "User")
                {
                    var existing = UserService.Get(id);
                    if (existing != null)
                    {
                        Console.Write($"New username (current: {existing.Username}): ");
                        string newName = Console.ReadLine();
                        if (!string.IsNullOrWhiteSpace(newName)) existing.Username = newName;
                        UserService.Update(existing);
                        Console.WriteLine("Updated!");
                    }
                    else
                    {
                        Console.WriteLine($"\nUpdate failed! User with ID {id} not found.");
                    }
                }
            }
            else
            {
                Console.WriteLine("\nInvalid input! Please enter a number.");
            }
        }

        static void ExecuteDelete(string entity)
        {
            Console.Write("\nEnter ID to delete: ");
            if (int.TryParse(Console.ReadLine(), out int id))
            {
                if (entity == "User")
                {
                    UserService.Delete(id);
                    Console.WriteLine($"\nUser with ID {id} has been removed.");
                }
                else
                {
                    Console.WriteLine($"\nDelete failed! ID {id} not found.");
                }
            }
            else
            {
                Console.WriteLine("\nInvalid input! Please enter a number.");
            }
        }
    }
}