using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class StatsController(IStatsService statsService) : BaseApiController
{
    [HttpGet("home")]
    public async Task<ActionResult<UserStatsDto>> GetHomePageStats()
    {
        var userId = User.GetUserId();
        var stats = await statsService.GetUserStatsAsync(userId);
        return Ok(stats);
    }

    [HttpPost("session")]
    public async Task<ActionResult<StudySessionResultDto>> SaveStudySession(UpdateSessionStatsDto updateDto)
    {
        var userId = User.GetUserId();
        var result = await statsService.SaveStudySessionAsync(userId, updateDto);
        
        if (result != null) return Ok(result);
        
        return BadRequest("Failed to update session stats");
    }
}
