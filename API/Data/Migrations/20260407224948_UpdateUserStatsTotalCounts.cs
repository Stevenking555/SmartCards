using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserStatsTotalCounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LongestStreak",
                table: "UserStats",
                newName: "TotalMasteredCards");

            migrationBuilder.AddColumn<long>(
                name: "TotalCards",
                table: "UserStats",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<int>(
                name: "TotalDecks",
                table: "UserStats",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalCards",
                table: "UserStats");

            migrationBuilder.DropColumn(
                name: "TotalDecks",
                table: "UserStats");

            migrationBuilder.RenameColumn(
                name: "TotalMasteredCards",
                table: "UserStats",
                newName: "LongestStreak");
        }
    }
}
