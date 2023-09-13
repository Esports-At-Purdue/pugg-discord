import {AttachmentBuilder, Guild} from "discord.js";
import {Player} from "../saveables/player";
import * as Canvas from "canvas";
import ImageUtils from "./image.utils";

export class ProfileImage {
    public player: Player;
    public width: number;
    public height: number;
    backgroundPath: string;

    constructor(player: Player) {
        this.player = player;
        this.width = 1125;
        this.height = 375;
        this.backgroundPath = "./src/media/profile.png";
    }

    public async draw(guild: Guild, allPlayers: Player[]) {
        Canvas.registerFont("./font.ttf", { family: "Custom" });
        const canvas = Canvas.createCanvas(this.width, this.height);
        const context = canvas.getContext("2d");
        const background = await Canvas.loadImage(this.backgroundPath);
        const players = allPlayers.sort((a, b) => b.stats.elo - a.stats.elo);
        const player = players.find(player => player.id == this.player.id) as Player;
        const rank = players.indexOf(player) + 1;
        const member = await guild.members.fetch(player.id);
        const avatarUrl = member.displayAvatarURL( { extension: "png", size: 256 });
        const avatarImage = await Canvas.loadImage(avatarUrl);
        const rankImage = await Canvas.loadImage(`./src/media/${Player.getRankFile(rank, player.stats.elo)}`);

        ImageUtils.printImage(context, background, 0, 0, canvas.width, canvas.height);
        ImageUtils.printImage(context, rankImage, 825, 65, 200, 200);
        ImageUtils.printProfilePicture(context, avatarImage, 202, 160, 108);
        ImageUtils.printText(context, `${player.firstName}`, 202, 336, "#FFFFFF", 75,"center");
        ImageUtils.printText(context, `Elo:`, 365, 105, "#FFFFFF", 75,"left");
        ImageUtils.printText(context, `Sets Won:`, 365, 168, "#FFFFFF", 75,"left");
        ImageUtils.printText(context, `Points Won:`, 365, 231, "#FFFFFF", 75,"left");
        ImageUtils.printText(context, `Win Rate:`, 365, 294, "#FFFFFF", 75,"left");
        ImageUtils.printText(context, `${player.stats.elo}`, 785, 105, "#FFFFFF", 75,"right");
        ImageUtils.printText(context, `${player.stats.wins}`, 785, 168, "#FFFFFF", 75,"right");
        ImageUtils.printText(context, `${player.stats.losses}`, 785, 231, "#FFFFFF", 75,"right");
        ImageUtils.printText(context, `${Math.floor(player.winRate)}%`, 785, 294, "#FFFFFF", 75,"right");
        ImageUtils.printText(context, `${ImageUtils.ordinalSuffixOf(rank)}`, 925, 336 , "#FFFFFF", 75, "center");

        return new AttachmentBuilder(canvas.toBuffer(), { name: `profile-${player.username}.png` });
    }
}