namespace QuestLogApi.DTOs;

public record RegisterRequest(string Username, string Password);
public record LoginRequest(string Username, string Password);

public record UserResponse(string Id, string Username);

public record CreateReviewRequest(int Rating, string Content);

public record ReviewResponse(
    string Id,
    string GameId,
    string UserId,
    string Username,
    int Rating,
    string Content,
    int HelpfulCount,
    string Date,
    string AiLabel,
    float AiScore
);

public record GameResponse(
    string Id,
    string Title,
    string Thumbnail,
    string Banner,
    string Genre,
    string Developer,
    string Description,
    string Playtime,
    string ReleaseDate,
    float Rating,
    List<ReviewResponse> Reviews
);

public record GameListItem(
    string Id,
    string Title,
    string Thumbnail,
    string Banner,
    string Genre,
    string Developer,
    string Description,
    string Playtime,
    string ReleaseDate,
    float Rating,
    int ReviewCount
);

public record AiResult(string Label, float Score);
