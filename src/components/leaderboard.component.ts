import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {Player} from "../models/player";

export class LeaderboardComponent extends ActionRowBuilder<ButtonBuilder> {
    constructor(page: number, players: Player[], disabled: boolean) {
        super();
        const maxPages = Math.ceil(players.length / 5);
        if (page == 1) {
            this.addComponents(
                new ButtonBuilder()
                    .setEmoji("👈")
                    .setCustomId(`leaderboard-${page - 1}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setEmoji("👉")
                    .setCustomId(`leaderboard-${page + 1}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setEmoji("🔄")
                    .setCustomId(`leaderboard-${page}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
            )
        }
        else if (page == maxPages) {
            this.addComponents(
                new ButtonBuilder()
                    .setEmoji("👈")
                    .setCustomId(`leaderboard-${page - 1}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setEmoji("👉")
                    .setCustomId(`leaderboard-${page + 1}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setEmoji("🔄")
                    .setCustomId(`leaderboard-${page}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
            )
        }
        else {
            this.addComponents(
                new ButtonBuilder()
                    .setEmoji("👈")
                    .setCustomId(`leaderboard-${page - 1}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setEmoji("👉")
                    .setCustomId(`leaderboard-${page + 1}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setEmoji("🔄")
                    .setCustomId(`leaderboard-${page}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
            )
        }
    }
}