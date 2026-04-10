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

using AutoMapper;

namespace API.Controllers;

public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService, IMapper mapper, IUnitOfWork unitOfWork) : BaseApiController
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

        var userStats = new UserStats
        {
            AppUserId = user.Id,
            FlippedCardsTotal = 0,
            FlippedCardsToday = 0,
            LearningStreak = 0,
            TotalDecks = 0,
            TotalCards = 0,
            TotalMasteredCards = 0,
            LastFlipAt = DateTime.UtcNow,
            WeeklyActivityJson = "[]"
        };

        unitOfWork.StatsRepository.AddUserStats(userStats);
        await unitOfWork.Complete();

        await SetRefreshTokenCookie(user);

        return await CreateUserDto(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await userManager.FindByEmailAsync(loginDto.Email);

        if (user == null) return Unauthorized("Invalid email address");

        var result = await userManager.CheckPasswordAsync(user, loginDto.Password);

        if (!result) return Unauthorized("Invalid password");

        await SetRefreshTokenCookie(user);

        return await CreateUserDto(user);
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

        await UpdateRefreshTokenCookie(user);
        
        return await CreateUserDto(user);
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
            Expires = user.RefreshTokenExpiry.Value
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    private async Task UpdateRefreshTokenCookie(AppUser user)
    {
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(15);
        await userManager.UpdateAsync(user);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = user.RefreshTokenExpiry.Value
        };

        Response.Cookies.Append("refreshToken", user.RefreshToken, cookieOptions);
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

        // 1. Manuális jelszó ellenőrzés, hogy mi kontrolláljuk a hibaüzenetet
        var passwordCheck = await userManager.CheckPasswordAsync(user, changePasswordDto.OldPassword);
        if (!passwordCheck)
        {
            ModelState.AddModelError("CurrentPassword", "error.password.mismatch");
            return ValidationProblem();
        }

        // 2. Ha a régi jó, akkor jöhet a csere (az új jelszó komplexitását még mindig az Identity védi)
        var result = await userManager.ChangePasswordAsync(user, changePasswordDto.OldPassword, changePasswordDto.NewPassword);

        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("Identity", error.Description);
            }
            return ValidationProblem();
        }

        return Ok(new { message = "Password changed successfully" });
    }

    [Authorize]
    [HttpPut("update-email")]
    public async Task<ActionResult<UserDto>> UpdateEmail(UpdateEmailDto updateEmailDto)
    {
        var user = await userManager.FindByIdAsync(User.GetUserId());
        if (user == null) return NotFound();

        var passwordCheck = await userManager.CheckPasswordAsync(user, updateEmailDto.CurrentPassword);

        if (!passwordCheck)
        {
            ModelState.AddModelError("CurrentPassword", "error.password.mismatch");
            return ValidationProblem();
        }

        user.Email = updateEmailDto.NewEmail;
        user.UserName = updateEmailDto.NewEmail;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("Email", error.Description);
            }
            return ValidationProblem();
        }

        return await CreateUserDto(user);
    }

    private async Task<UserDto> CreateUserDto(AppUser user)
    {
        var dto = mapper.Map<UserDto>(user);
        dto.Token = await tokenService.CreateToken(user);
        return dto;
    }
}

