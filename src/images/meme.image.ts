import {AttachmentBuilder, User} from "discord.js";
import * as Canvas from "canvas";
import ImageUtils from "./image.utils";

export class MemeImage {
    public user: User;
    public width: number;
    public height: number;
    backgroundPath: string;

    constructor(user: User) {
        this.user = user;
        this.width = 2905;
        this.height = 3840;
        this.backgroundPath = "./src/media/meme.png";
    }

    public async draw() {
        const canvas = Canvas.createCanvas(this.width, this.height);
        const context = canvas.getContext("2d");
        const background = await Canvas.loadImage(this.backgroundPath);
        const avatarUrl = this.user.displayAvatarURL( { extension: "png", size: 256 });
        const avatarImage = await Canvas.loadImage(avatarUrl);

        ImageUtils.printImage(context, background, 0, 0, canvas.width, canvas.height);
        ImageUtils.printImage(context, avatarImage, 137, 344, 364, 364);
        ImageUtils.printImage(context, avatarImage, 179, 1570, 364, 364);
        ImageUtils.printImage(context, avatarImage, 197, 2876, 364, 364);

        return new AttachmentBuilder(canvas.toBuffer(), { name: `meme-${this.user.username}.png` });
    }
}