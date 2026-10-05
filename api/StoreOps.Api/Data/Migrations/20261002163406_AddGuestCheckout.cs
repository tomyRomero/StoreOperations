using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StoreOps.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestCheckout : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_Checkouts_UserId_Open",
                table: "Checkouts");

            migrationBuilder.AddColumn<bool>(
                name: "GuestCheckout",
                table: "StoreSettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Orders",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "AccessToken",
                table: "Orders",
                type: "char(48)",
                unicode: false,
                fixedLength: true,
                maxLength: 48,
                nullable: true);

            // Every existing order is a customer's: it takes their email, then the column becomes required
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Orders",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE t SET t.[Email] = u.[Email] FROM [Orders] t JOIN [AspNetUsers] u ON u.[Id] = t.[UserId];");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Orders",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Checkouts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            // Every existing checkout is a customer's: it takes their email, then the column becomes required
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Checkouts",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE t SET t.[Email] = u.[Email] FROM [Checkouts] t JOIN [AspNetUsers] u ON u.[Id] = t.[UserId];");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Checkouts",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestKey",
                table: "Checkouts",
                type: "char(48)",
                unicode: false,
                fixedLength: true,
                maxLength: 48,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "StoreSettings",
                keyColumn: "Id",
                keyValue: 1,
                column: "GuestCheckout",
                value: true);

            migrationBuilder.CreateIndex(
                name: "UX_Orders_AccessToken",
                table: "Orders",
                column: "AccessToken",
                unique: true,
                filter: "[AccessToken] IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Orders_Reachable",
                table: "Orders",
                sql: "[UserId] IS NOT NULL OR [AccessToken] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Checkouts_GuestKey",
                table: "Checkouts",
                column: "GuestKey",
                unique: true,
                filter: "[GuestKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Checkouts_UserId_Open",
                table: "Checkouts",
                column: "UserId",
                unique: true,
                filter: "[Status] = 'Open' AND [UserId] IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Checkouts_Owner",
                table: "Checkouts",
                sql: "([UserId] IS NOT NULL AND [GuestKey] IS NULL) OR ([UserId] IS NULL AND [GuestKey] IS NOT NULL)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_Orders_AccessToken",
                table: "Orders");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Orders_Reachable",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "UX_Checkouts_GuestKey",
                table: "Checkouts");

            migrationBuilder.DropIndex(
                name: "UX_Checkouts_UserId_Open",
                table: "Checkouts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Checkouts_Owner",
                table: "Checkouts");

            migrationBuilder.DropColumn(
                name: "GuestCheckout",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "AccessToken",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Checkouts");

            migrationBuilder.DropColumn(
                name: "GuestKey",
                table: "Checkouts");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Checkouts",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "UX_Checkouts_UserId_Open",
                table: "Checkouts",
                column: "UserId",
                unique: true,
                filter: "[Status] = 'Open'");
        }
    }
}
