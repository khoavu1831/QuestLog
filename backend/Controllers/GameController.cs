using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestLogApi.Data;
using QuestLogApi.DTOs;

namespace QuestLogApi.Controllers;

[ApiController]
[Route("api/games")]
public class GameController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var games = await db.Games
            .Include(g => g.Reviews)
            .ToListAsync();

        var result = games.Select(g => new GameListItem(
            g.Id, g.Title, g.Thumbnail, g.Banner,
            g.Genre, g.Developer, g.Description, g.Playtime,
            g.ReleaseDate.ToString("yyyy-MM-dd"),
            g.Rating,
            g.Featured,
            g.Reviews.Count
        ));

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var game = await db.Games
            .Include(g => g.Reviews)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (game == null)
            return NotFound();

        var reviews = game.Reviews
            .OrderByDescending(r => r.Date)
            .Select(r => new ReviewResponse(
                r.Id, r.GameId, r.UserId, r.Username,
                string.IsNullOrEmpty(r.AiLabel) ? "Contributor" : r.AiLabel,
                r.Rating, r.Content, r.HelpfulCount,
                r.Date.ToString("yyyy-MM-dd"),
                r.AiLabel, r.AiScore
            ))
            .ToList();

        var result = new GameResponse(
            game.Id, game.Title, game.Thumbnail, game.Banner,
            game.Genre, game.Developer, game.Description, game.Playtime,
            game.ReleaseDate.ToString("yyyy-MM-dd"),
            game.Rating,
            game.Featured,
            game.AiSummary,
            reviews
        );

        return Ok(result);
    }
}
