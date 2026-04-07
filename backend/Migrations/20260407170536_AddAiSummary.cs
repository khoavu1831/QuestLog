using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuestLogApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAiSummary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AiSummary_Cons",
                table: "Games",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<float>(
                name: "AiSummary_FinalScore",
                table: "Games",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiSummary_Pros",
                table: "Games",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "AiSummary_Sentiment",
                table: "Games",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "AiSummary_SentimentScore",
                table: "Games",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiSummary_Cons",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AiSummary_FinalScore",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AiSummary_Pros",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AiSummary_Sentiment",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AiSummary_SentimentScore",
                table: "Games");
        }
    }
}
