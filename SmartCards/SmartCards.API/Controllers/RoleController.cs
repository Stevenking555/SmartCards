using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartCards.API.Data;
using SmartCards.API.Models;
using SmartCards.API.Services;

namespace SmartCards.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // URL: api/users
    public class RoleController : ControllerBase
    {
        public RoleController() { }

        [HttpGet]
        public ActionResult<List<Role>> GetAll()
        {
            return RoleService.GetAll();
        }

        [HttpGet("get/{id}")]
        public ActionResult<Role> Get(int id)
        {
            var result = RoleService.Get(id);

            if (result is null)
            {
                return NotFound();
            }
            return result;
        }

        [HttpPost]
        public IActionResult Create(Role role)
        {
            RoleService.Add(role);
            return CreatedAtAction(nameof(Get), new { id = role.Id }, role);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Role role)
        {
            if (id != role.Id) return BadRequest("ID mismatch");

            var check = RoleService.Get(role.Id);

            if (check is null)
            {
                return NotFound();
            }
            RoleService.Update(role);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var check = RoleService.Get(id);

            if (check is null)
            {
                return NotFound();
            }
            RoleService.Delete(id);
            return NoContent();
        }
    }
}
