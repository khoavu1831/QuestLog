namespace QuestLogApi.Models;

public class AiSummary
{
    public string Sentiment { get; set; } = string.Empty;
    public int SentimentScore { get; set; }
    public float FinalScore { get; set; }
    public List<string> Pros { get; set; } = [];
    public List<string> Cons { get; set; } = [];
}
