using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixGuidToString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Decks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    AppUserId = table.Column<string>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Decks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Decks_AspNetUsers_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserStats",
                columns: table => new
                {
                    AppUserId = table.Column<string>(type: "TEXT", nullable: false),
                    FlippedCardsTotal = table.Column<long>(type: "INTEGER", nullable: false),
                    FlippedCardsToday = table.Column<int>(type: "INTEGER", nullable: false),
                    LearningStreak = table.Column<int>(type: "INTEGER", nullable: false),
                    LongestStreak = table.Column<int>(type: "INTEGER", nullable: false),
                    LastFlipAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    WeeklyActivityJson = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserStats", x => x.AppUserId);
                    table.ForeignKey(
                        name: "FK_UserStats_AspNetUsers_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DeckId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Question = table.Column<string>(type: "TEXT", nullable: false),
                    Answer = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cards_Decks_DeckId",
                        column: x => x.DeckId,
                        principalTable: "Decks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DeckStats",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AppUserId = table.Column<string>(type: "TEXT", nullable: false),
                    DeckId = table.Column<Guid>(type: "TEXT", nullable: false),
                    KnowledgePercentage = table.Column<int>(type: "INTEGER", nullable: false),
                    TimeSpentMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    LastPlayedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeckStats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeckStats_AspNetUsers_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeckStats_Decks_DeckId",
                        column: x => x.DeckId,
                        principalTable: "Decks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CardStats",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AppUserId = table.Column<string>(type: "TEXT", nullable: false),
                    CardId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BatchIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    RotationPoints = table.Column<int>(type: "INTEGER", nullable: false),
                    IsMastered = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardStats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CardStats_AspNetUsers_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CardStats_Cards_CardId",
                        column: x => x.CardId,
                        principalTable: "Cards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cards_DeckId",
                table: "Cards",
                column: "DeckId");

            migrationBuilder.CreateIndex(
                name: "IX_CardStats_AppUserId",
                table: "CardStats",
                column: "AppUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CardStats_CardId",
                table: "CardStats",
                column: "CardId");

            migrationBuilder.CreateIndex(
                name: "IX_Decks_AppUserId",
                table: "Decks",
                column: "AppUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeckStats_AppUserId",
                table: "DeckStats",
                column: "AppUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeckStats_DeckId",
                table: "DeckStats",
                column: "DeckId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CardStats");

            migrationBuilder.DropTable(
                name: "DeckStats");

            migrationBuilder.DropTable(
                name: "UserStats");

            migrationBuilder.DropTable(
                name: "Cards");

            migrationBuilder.DropTable(
                name: "Decks");
        }
    }
}
