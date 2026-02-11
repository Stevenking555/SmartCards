using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartCards.API.Data;
using SmartCards.API.Models;
using SmartCards.API.Services;

namespace SmartCards.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // URL: api/users
    public class UserController : ControllerBase
    {
        public UserController() { }

        [HttpGet]
        public ActionResult<List<User>> GetAll()
        {
            return UserService.GetAll();
        }

        [HttpGet("get/{id}")]
        public ActionResult<User> Get(int id)
        {
            var result = UserService.Get(id);

            if (result is null)
            {
                return NotFound();
            }
            return result;
        }

        [HttpPost]
        public IActionResult Create(User User)
        {
            UserService.Add(User);
            return CreatedAtAction(nameof(Get), new { id = User.Id }, User);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, User user)
        {
            if (id != user.Id) return BadRequest("ID mismatch");

            var check = UserService.Get(user.Id);

            if (check is null)
            {
                return NotFound();
            }
            UserService.Update(user);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var check = UserService.Get(id);

            if (check is null)
            {
                return NotFound();
            }
            UserService.Delete(id);
            return NoContent();
        }
    }
}