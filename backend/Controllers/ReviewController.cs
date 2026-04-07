using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestLogApi.Data;
using QuestLogApi.DTOs;
using QuestLogApi.Models;
using QuestLogApi.Services;

namespace QuestLogApi.Controllers;

[ApiController]
[Route("api")]
public class ReviewController(AppDbContext db, AiService aiService) : ControllerBase
{
    [HttpPost("games/{gameId}/reviews")]
    public async Task<IActionResult> AddReview(string gameId, [FromBody] CreateReviewRequest req)
    {
        var game = await db.Games.Include(g => g.Reviews).FirstOrDefaultAsync(g => g.Id == gameId);
        if (game == null)
            return NotFound(new { error = "Game not found." });

        string? userId = Request.Headers["X-User-Id"].FirstOrDefault();
        string? username = Request.Headers["X-Username"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(username))
            return Unauthorized(new { error = "Authentication required." });

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return Unauthorized(new { error = "User not found." });

        if (req.Content.Trim().Length < 10)
            return BadRequest(new { error = "Review must be at least 10 characters." });

        var aiResult = await aiService.ClassifyReviewAsync(req.Content, req.Rating);

        var review = new Review
        {
            Id = Guid.NewGuid().ToString(),
            GameId = gameId,
            UserId = userId,
            Username = username,
            Rating = req.Rating,
            Content = req.Content.Trim(),
            HelpfulCount = 0,
            Date = DateTime.UtcNow,
            AiLabel = aiResult.Label,
            AiScore = aiResult.Score
        };

        db.Reviews.Add(review);

        var allReviews = game.Reviews.ToList();
        allReviews.Add(review);
        game.Rating = (float)Math.Round(allReviews.Average(r => r.Rating), 1);

        await db.SaveChangesAsync();

        return Ok(new ReviewResponse(
            review.Id, review.GameId, review.UserId, review.Username,
            review.Rating, review.Content, review.HelpfulCount,
            review.Date.ToString("yyyy-MM-dd"),
            review.AiLabel, review.AiScore
        ));
    }

    [HttpPost("reviews/{reviewId}/helpful")]
    public async Task<IActionResult> MarkHelpful(string reviewId)
    {
        var review = await db.Reviews.FindAsync(reviewId);
        if (review == null)
            return NotFound(new { error = "Review not found." });

        review.HelpfulCount += 1;
        await db.SaveChangesAsync();

        return Ok(new { helpfulCount = review.HelpfulCount });
    }
}
