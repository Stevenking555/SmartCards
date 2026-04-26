// Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.
using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class UserController(IUnitOfWork uow, UserManager<AppUser> userManager) : BaseApiController
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

            var appUser = await userManager.FindByIdAsync(userId);
            if (appUser == null) return BadRequest("Could not get appUser");

            // Verify current password
            if (string.IsNullOrEmpty(userUpdateDto.CurrentPassword)) return BadRequest("Password is required");

            var resultCheck = await userManager.CheckPasswordAsync(appUser, userUpdateDto.CurrentPassword);
            if (!resultCheck)
            {
                ModelState.AddModelError("CurrentPassword", "error.password.mismatch");
                return ValidationProblem();
            }

            appUser.DisplayName = userUpdateDto.DisplayName ?? appUser.DisplayName;

            var result = await userManager.UpdateAsync(appUser);
            if (result.Succeeded) return NoContent();

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("Identity", error.Description);
            }
            return ValidationProblem();
        }
    }
}

