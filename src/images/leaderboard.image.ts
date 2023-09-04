import {Player} from "../saveables/player";
import ImageUtils from "./image.utils";
import * as Canvas from "canvas";
import {AttachmentBuilder, Guild} from "discord.js";

export class LeaderboardImage {
    public page: number
    public width: number;
    public height: number;
    public backgroundPath: string;

    constructor(page: number) {
        this.page = page;
        this.width = 2560;
        this.height = 1440;
        this.backgroundPath = "./src/media/leaderboard.png";
    }

    public async draw(guild: Guild, allPlayers: Player[]) {
        Canvas.registerFont("./font.ttf", { family: "Custom" });
        const canvas = Canvas.createCanvas(this.width, this.height);
        const context = canvas.getContext("2d");
        const offset = (this.page - 1) * 5;
        const background = await Canvas.loadImage(this.backgroundPath);
        const players = allPlayers
            .sort((a, b) => b.stats.elo - a.stats.elo)
            .slice(offset)
            .slice(0, 5)

        ImageUtils.printImage(canvas.getContext("2d"), background, 0, 0, canvas.width, canvas.height);

        for (let i = 0; i < players.length; i++) {
            const rank = i + offset + 1;
            const player = players[i];
            const member = await guild.members.fetch(player.id);
            const avatarUrl = member.displayAvatarURL( { extension: "png", size: 256 });
            const avatarImage = await Canvas.loadImage(avatarUrl);
            const rankImage = await Canvas.loadImage(`./src/media/${Player.getRankFile(rank, player.stats.elo)}`);
            ImageUtils.printImage(context, rankImage, 144, 400 + 200 * i, 125, 125);
            ImageUtils.printProfilePicture(context, avatarImage, 980, 460 + 200 * i, 64);
            ImageUtils.printText(context, `${player.firstName} ${player.lastName.charAt(0)}`, 1080, 515 + 200 * i, "#FFFFFF", 150, "left");
            ImageUtils.printText(context, `${player.stats.elo} Elo`, 2200, 515 + 200 * i, "#FFFFFF", 150, "center");
            ImageUtils.printText(context, `${ImageUtils.ordinalSuffixOf(rank)}`, 550, 515 + 200 * i, "#FFFFFF",  150, "center");
        }

        return new AttachmentBuilder(canvas.toBuffer(), { name: `leaderboard-${this.page}.png` });
    }
}