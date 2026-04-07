using System.Text.Json;
using QuestLogApi.DTOs;

namespace QuestLogApi.Services;

public class AiService(HttpClient httpClient, ILogger<AiService> logger)
{
    private const string PythonServiceUrl = "http://localhost:5001";

    public async Task<AiResult> ClassifyReviewAsync(string content, int rating)
    {
        try
        {
            var payload = new { text = content, rating };
            var json = JsonSerializer.Serialize(payload);
            var httpContent = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync($"{PythonServiceUrl}/classify", httpContent);
            response.EnsureSuccessStatusCode();
            var body = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<AiResult>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return result ?? new AiResult("NOT HELPFUL", 100f);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "AI service unreachable, applying rule-based fallback");
            return ApplyRuleBasedFallback(content, rating);
        }
    }

    private static AiResult ApplyRuleBasedFallback(string content, int rating)
    {
        var words = content.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        int wordCount = words.Length;

        if (wordCount < 15)
        {
            return new AiResult("NOT HELPFUL", 100f);
        }

        float threshold = rating switch
        {
            <= 2 => 0.70f,
            3 => 0.50f,
            _ => 0.35f
        };

        string[] domainKeywords = ["graphics", "gameplay", "story", "mechanics", "bugs", "performance", "fps", "soundtrack", "combat", "optimization"];
        string lower = content.ToLower();
        int keywordCount = domainKeywords.Count(kw => System.Text.RegularExpressions.Regex.IsMatch(lower, $@"\b{kw}\b"));

        float prob = 0.5f;
        if (wordCount > 30 && keywordCount >= 2)
        {
            prob = Math.Min(prob + 0.15f, 1.0f);
        }

        if (prob >= threshold)
        {
            float confidence = 50f + ((prob - threshold) / (1.0f - threshold)) * 50f;
            return new AiResult("HELPFUL", MathF.Round(confidence, 2));
        }
        else
        {
            float confidence = 50f + ((threshold - prob) / threshold) * 50f;
            return new AiResult("NOT HELPFUL", MathF.Round(confidence, 2));
        }
    }
}
