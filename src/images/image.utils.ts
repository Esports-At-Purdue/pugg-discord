import {CanvasRenderingContext2D, Image} from "canvas";

export default class ImageUtils {

    public static printText
    (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, size: number, alignment: CanvasTextAlign) {
        ctx.font = `${size}px Custom`;
        ctx.fillStyle = color;
        ctx.textAlign = alignment;
        ctx.fillText(text, x, y);
        ctx.save();
    }

    public static printImage
    (ctx: CanvasRenderingContext2D, image: Image, x: number, y: number, width: number, height: number) {
        ctx.drawImage(image, x, y, width, height);
        ctx.restore();
        ctx.save();
    }

    public static printProfilePicture
    (ctx: CanvasRenderingContext2D, image: Image, x: number, y: number, radius: number) {
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.05, 0, Math.PI * 2, true)
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, true)
        ctx.clip();
        ctx.drawImage(image, x - radius, y - radius, 2 * radius, 2 * radius);
        ctx.restore();
        ctx.save();
    }

    public static ordinalSuffixOf(i: number): string {
        let j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }
}