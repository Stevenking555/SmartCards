using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class UserController(IUnitOfWork uow) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers()
        {
            return Ok(await uow.UserRepository.GetUsersAsync());
        }

        [HttpGet("{id}")] // locahost:5001/api/users/bob-id
        public async Task<ActionResult<AppUser>> GetUser(string id)
        {
            var appUser = await uow.UserRepository.GetUserByIdAsync(id);

            if (appUser == null) return NotFound();

            return appUser;
        }
        
        [HttpPut]
        public async Task<ActionResult> UpdateUser(UserUpdateDto userUpdateDto)
        {
            var userId = User.GetUserId();

            var appUser = await uow.UserRepository.GetUserForUpdate(userId);

            if (appUser == null) return BadRequest("Could not get appUser");

            appUser.DisplayName = userUpdateDto.DisplayName ?? appUser.DisplayName;

            uow.UserRepository.Update(appUser); // optional

            if (await uow.Complete()) return NoContent();

            return BadRequest("Failed to update AppUser");
        }
    }
}
