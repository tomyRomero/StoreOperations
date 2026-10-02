using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StoreOps.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStorefront : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AboutText",
                table: "StoreSettings",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccentColor",
                table: "StoreSettings",
                type: "varchar(7)",
                unicode: false,
                maxLength: 7,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactAddress",
                table: "StoreSettings",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "StoreSettings",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "StoreSettings",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FacebookUrl",
                table: "StoreSettings",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeroButtonLabel",
                table: "StoreSettings",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeroHeadline",
                table: "StoreSettings",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeroHighlight",
                table: "StoreSettings",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeroText",
                table: "StoreSettings",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HomeSections",
                table: "StoreSettings",
                type: "varchar(100)",
                unicode: false,
                maxLength: 100,
                nullable: false,
                defaultValue: "Categories,NewIn,Newsletter");

            migrationBuilder.AddColumn<string>(
                name: "InstagramUrl",
                table: "StoreSettings",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LogoImageKey",
                table: "StoreSettings",
                type: "varchar(300)",
                unicode: false,
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PinterestUrl",
                table: "StoreSettings",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductNoun",
                table: "StoreSettings",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "product");

            migrationBuilder.AddColumn<string>(
                name: "ProductNounPlural",
                table: "StoreSettings",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "products");

            migrationBuilder.AddColumn<string>(
                name: "Tagline",
                table: "StoreSettings",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Theme",
                table: "StoreSettings",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: false,
                defaultValue: "NightStudio");

            migrationBuilder.AddColumn<string>(
                name: "TikTokUrl",
                table: "StoreSettings",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YouTubeUrl",
                table: "StoreSettings",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            // A new store is now "My store", not the demo's name. Only a settings row nobody has ever saved
            // (still at its creation time) is renamed; an existing store keeps its name, and the new columns'
            // defaults fill in the rest.
            migrationBuilder.Sql(
                "UPDATE [StoreSettings] SET [StoreName] = N'My store' " +
                "WHERE [Id] = 1 AND [StoreName] = N'Palettehub' AND [UpdatedAtUtc] = '2026-09-30T00:00:00';");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StoreSettings_AccentColor",
                table: "StoreSettings",
                sql: "[AccentColor] IS NULL OR [AccentColor] LIKE '#[0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F]'");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StoreSettings_Theme",
                table: "StoreSettings",
                sql: "[Theme] IN ('NightStudio', 'Atelier')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_StoreSettings_AccentColor",
                table: "StoreSettings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StoreSettings_Theme",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "AboutText",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "AccentColor",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "ContactAddress",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "FacebookUrl",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "HeroButtonLabel",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "HeroHeadline",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "HeroHighlight",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "HeroText",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "HomeSections",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "InstagramUrl",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "LogoImageKey",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "PinterestUrl",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "ProductNoun",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "ProductNounPlural",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "Tagline",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "Theme",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "TikTokUrl",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "YouTubeUrl",
                table: "StoreSettings");
        }
    }
}
