using System.ComponentModel.DataAnnotations.Schema;

namespace SmartCards.API.Models
{
    [Table("roles")]
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}