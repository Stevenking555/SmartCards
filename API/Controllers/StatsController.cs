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
    public async Task<ActionResult<HomePageStatsDto>> GetHomePageStats()
    {
        var userId = User.GetUserId();
        var stats = await statsService.GetHomePageStatsAsync(userId);
        return Ok(stats);
    }

    [HttpPost("session")]
    public async Task<ActionResult> UpdateSessionStats(UpdateSessionStatsDto updateDto)
    {
        var userId = User.GetUserId();
        var success = await statsService.UpdateSessionStatsAsync(userId, updateDto);
        
        if (success) return Ok();
        
        return BadRequest("Failed to update session stats");
    }
}
