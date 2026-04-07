using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using QuestLogApi.Models;

namespace QuestLogApi.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Games.Any() && db.Users.Any())
            return; // Already seeded

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        
        var frontendDir = Path.Combine(Directory.GetCurrentDirectory(), "..", "frontend", "src", "data");
        var gamesPath = Path.Combine(frontendDir, "games.json");
        var usersPath = Path.Combine(frontendDir, "users.json");

        if (!File.Exists(gamesPath) || !File.Exists(usersPath))
            return;

        var gamesJson = File.ReadAllText(gamesPath);
        var usersJson = File.ReadAllText(usersPath);

        var seedGames = JsonSerializer.Deserialize<List<SeedGame>>(gamesJson, options) ?? [];
        var seedUsers = JsonSerializer.Deserialize<List<SeedUser>>(usersJson, options) ?? [];

        // 1. Create Users map
        var userDict = new Dictionary<string, User>(StringComparer.OrdinalIgnoreCase);

        // Add users from users.json
        foreach (var u in seedUsers)
        {
            if (!userDict.ContainsKey(u.Username))
            {
                userDict[u.Username] = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = u.Username,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(string.IsNullOrEmpty(u.Password) ? "password123" : u.Password)
                };
            }
        }

        // Add additional users found in reviews
        foreach (var fg in seedGames)
        {
            foreach (var r in fg.Reviews)
            {
                if (!userDict.ContainsKey(r.Username))
                {
                    userDict[r.Username] = new User
                    {
                        Id = Guid.NewGuid().ToString(),
                        Username = r.Username,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123")
                    };
                }
            }
        }

        // Insert Users
        db.Users.AddRange(userDict.Values);
        db.SaveChanges(); // Save to generate IDs

        // 2. Create Games and Reviews
        foreach (var fg in seedGames)
        {
            var game = new Game
            {
                Id = Guid.NewGuid().ToString(),
                Title = fg.Title ?? "",
                Genre = fg.Genre ?? "",
                Description = fg.Description ?? "",
                Thumbnail = fg.Thumbnail ?? "",
                Banner = fg.Banner ?? "",
                Rating = fg.Rating,
                Developer = fg.Developer ?? "",
                Playtime = fg.Playtime ?? "",
                Featured = fg.Featured,
                ReleaseDate = DateTime.TryParse(fg.ReleaseDate, out var date) ? date : DateTime.UtcNow,
                AiSummary = fg.AiSummary != null ? new Models.AiSummary
                {
                    Sentiment = fg.AiSummary.Sentiment ?? "",
                    SentimentScore = fg.AiSummary.SentimentScore,
                    FinalScore = fg.AiSummary.FinalScore,
                    Pros = fg.AiSummary.Pros ?? [],
                    Cons = fg.AiSummary.Cons ?? []
                } : null
            };

            foreach (var r in fg.Reviews)
            {
                var user = userDict[r.Username];
                var review = new Review
                {
                    Id = Guid.NewGuid().ToString(),
                    GameId = game.Id,
                    UserId = user.Id,
                    Username = user.Username,
                    Rating = r.Rating,
                    Content = r.Content ?? "",
                    HelpfulCount = r.Helpful,
                    Date = DateTime.TryParse(r.Date, out var rDate) ? rDate : DateTime.UtcNow,
                    AiLabel = r.Level, // mapping frontend Level to backend AiLabel for mock 
                    AiScore = 0.9f 
                };
                game.Reviews.Add(review);
            }

            db.Games.Add(game);
        }

        db.SaveChanges();
    }

    private class SeedUser
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    private class SeedGame
    {
        public string Title { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Thumbnail { get; set; } = string.Empty;
        public string Banner { get; set; } = string.Empty;
        public float Rating { get; set; }
        public string Developer { get; set; } = string.Empty;
        public string Playtime { get; set; } = string.Empty;
        public string ReleaseDate { get; set; } = string.Empty;
        public bool Featured { get; set; }
        public SeedAiSummary? AiSummary { get; set; }
        public List<SeedReview> Reviews { get; set; } = [];
    }

    private class SeedAiSummary
    {
        public string Sentiment { get; set; } = string.Empty;
        public int SentimentScore { get; set; }
        public float FinalScore { get; set; }
        public List<string> Pros { get; set; } = [];
        public List<string> Cons { get; set; } = [];
    }

    private class SeedReview
    {
        public string Username { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Content { get; set; } = string.Empty;
        public int Helpful { get; set; }
        public string Date { get; set; } = string.Empty;
    }
}
