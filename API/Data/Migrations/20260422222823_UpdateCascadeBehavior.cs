using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCascadeBehavior : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CardStats_AspNetUsers_AppUserId",
                table: "CardStats");

            migrationBuilder.DropForeignKey(
                name: "FK_DeckStats_AspNetUsers_AppUserId",
                table: "DeckStats");

            migrationBuilder.DropForeignKey(
                name: "FK_DeckStats_Decks_DeckId",
                table: "DeckStats");

            migrationBuilder.AddForeignKey(
                name: "FK_CardStats_AspNetUsers_AppUserId",
                table: "CardStats",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DeckStats_AspNetUsers_AppUserId",
                table: "DeckStats",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DeckStats_Decks_DeckId",
                table: "DeckStats",
                column: "DeckId",
                principalTable: "Decks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CardStats_AspNetUsers_AppUserId",
                table: "CardStats");

            migrationBuilder.DropForeignKey(
                name: "FK_DeckStats_AspNetUsers_AppUserId",
                table: "DeckStats");

            migrationBuilder.DropForeignKey(
                name: "FK_DeckStats_Decks_DeckId",
                table: "DeckStats");

            migrationBuilder.AddForeignKey(
                name: "FK_CardStats_AspNetUsers_AppUserId",
                table: "CardStats",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DeckStats_AspNetUsers_AppUserId",
                table: "DeckStats",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DeckStats_Decks_DeckId",
                table: "DeckStats",
                column: "DeckId",
                principalTable: "Decks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
