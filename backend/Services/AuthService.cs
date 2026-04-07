using Microsoft.EntityFrameworkCore;
using QuestLogApi.Data;
using QuestLogApi.DTOs;
using QuestLogApi.Models;

namespace QuestLogApi.Services;

public class AuthService(AppDbContext db)
{
    public async Task<(bool Success, string Error, UserResponse? User)> RegisterAsync(RegisterRequest req)
    {
        if (req.Username.Trim().Length < 3)
            return (false, "Username must be at least 3 characters.", null);

        if (req.Password.Length < 6)
            return (false, "Password must be at least 6 characters.", null);

        bool exists = await db.Users.AnyAsync(u => u.Username.ToLower() == req.Username.ToLower().Trim());
        if (exists)
            return (false, "Username already taken.", null);

        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Username = req.Username.Trim(),
            PasswordHash = global::BCrypt.Net.BCrypt.HashPassword(req.Password)
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return (true, string.Empty, new UserResponse(user.Id, user.Username));
    }

    public async Task<(bool Success, string Error, UserResponse? User)> LoginAsync(LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == req.Username.ToLower().Trim());

        if (user == null)
            return (false, "Invalid username or password.", null);

        bool valid = global::BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!valid)
            return (false, "Invalid username or password.", null);

        return (true, string.Empty, new UserResponse(user.Id, user.Username));
    }
}
