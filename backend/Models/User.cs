using System.ComponentModel.DataAnnotations;

namespace QuestLogApi.Models;

public class User
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public ICollection<Review> Reviews { get; set; } = [];
}
