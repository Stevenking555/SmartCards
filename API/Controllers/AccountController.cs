using System;
using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService) : BaseApiController
{
    [HttpPost("register")] // api/account/register
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            UserName = registerDto.Email
        };

        var result = await userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("identity", error.Description);
            }

            return ValidationProblem();
        }

        await SetRefreshTokenCookie(user);

        return await user.ToDto(tokenService);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await userManager.FindByEmailAsync(loginDto.Email);

        if (user == null) return Unauthorized("Invalid email address");

        var result = await userManager.CheckPasswordAsync(user, loginDto.Password);

        if (!result) return Unauthorized("Invalid password");

        await SetRefreshTokenCookie(user);

        return await user.ToDto(tokenService);
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<UserDto>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null) return NoContent();

        var user = await userManager.Users
            .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken
                && x.RefreshTokenExpiry > DateTime.UtcNow);

        if (user == null) return Unauthorized();

        await SetRefreshTokenCookie(user);

        return await user.ToDto(tokenService);
    }

    private async Task SetRefreshTokenCookie(AppUser user)
    {
        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(15);
        await userManager.UpdateAsync(user);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(15)
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await userManager.Users
            .Where(x => x.Id == User.GetUserId())
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.RefreshToken, _ => null)
                .SetProperty(x => x.RefreshTokenExpiry, _ => null)
                );

        Response.Cookies.Delete("refreshToken");

        return Ok();
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
    {
        var user = await userManager.FindByIdAsync(User.GetUserId());
        if (user == null) return NotFound();

        // Ez a metódus leellenőrzi a régi jelszót, és ha jó, lecseréli az újra
        var result = await userManager.ChangePasswordAsync(user,
            changePasswordDto.OldPassword, changePasswordDto.NewPassword);

        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok("Password changed successfully");
    }

    [Authorize]
    [HttpPut("update-email")]
    public async Task<ActionResult<UserDto>> UpdateEmail(UpdateEmailDto updateEmailDto)
    {
        var user = await userManager.FindByIdAsync(User.GetUserId());
        if (user == null) return NotFound();

        var passwordCheck = await userManager.CheckPasswordAsync(user, updateEmailDto.CurrentPassword);

        if (!passwordCheck) return Unauthorized("Hibás jelszó! Az e-mail módosításhoz meg kell adnod a jelenlegi jelszavadat.");

        user.Email = updateEmailDto.NewEmail;
        user.UserName = updateEmailDto.NewEmail;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return await user.ToDto(tokenService);
    }
}
