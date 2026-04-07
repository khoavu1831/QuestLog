using Microsoft.AspNetCore.Mvc;
using QuestLogApi.DTOs;
using QuestLogApi.Services;

namespace QuestLogApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var (success, error, user) = await authService.RegisterAsync(req);
        if (!success)
            return BadRequest(new { error });
        return Ok(user);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var (success, error, user) = await authService.LoginAsync(req);
        if (!success)
            return Unauthorized(new { error });
        return Ok(user);
    }
}
