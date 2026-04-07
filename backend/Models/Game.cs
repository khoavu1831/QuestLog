using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuestLogApi.Models;

public class Game
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Thumbnail { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Banner { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Genre { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Developer { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Playtime { get; set; } = string.Empty;

    public DateTime ReleaseDate { get; set; }

    [Column(TypeName = "float")]
    public float Rating { get; set; }

    public bool Featured { get; set; }

    public AiSummary? AiSummary { get; set; }

    public ICollection<Review> Reviews { get; set; } = [];
}
