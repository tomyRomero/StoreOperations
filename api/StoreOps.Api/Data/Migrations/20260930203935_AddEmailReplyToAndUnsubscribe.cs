using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StoreOps.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailReplyToAndUnsubscribe : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReplyToAddress",
                table: "EmailOutbox",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UnsubscribeUrl",
                table: "EmailOutbox",
                type: "varchar(500)",
                unicode: false,
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReplyToAddress",
                table: "EmailOutbox");

            migrationBuilder.DropColumn(
                name: "UnsubscribeUrl",
                table: "EmailOutbox");
        }
    }
}
