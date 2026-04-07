using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuestLogApi.Models;

public class Review
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string GameId { get; set; } = string.Empty;

    [ForeignKey(nameof(GameId))]
    public Game? Game { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    [Column(TypeName = "text")]
    public string Content { get; set; } = string.Empty;

    public int HelpfulCount { get; set; } = 0;

    public DateTime Date { get; set; } = DateTime.UtcNow;

    [MaxLength(20)]
    public string AiLabel { get; set; } = string.Empty;

    [Column(TypeName = "float")]
    public float AiScore { get; set; }
}
