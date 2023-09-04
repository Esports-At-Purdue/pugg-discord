import {
    ActionRowBuilder,
    AuditLogEvent,
    ButtonBuilder,
    Client,
    ClientOptions,
    Colors,
    EmbedBuilder,
    Events,
    GuildAuditLogsEntry,
    GuildMember,
    HexColorString,
    Interaction,
    Message,
    PartialGuildMember,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextChannel, UserSelectMenuBuilder
} from "discord.js";
import {Server, ServerName} from "./saveables/server";
import axios from "axios";
import {InvalidAddressError, NotFoundError} from "./error";
import {Menu} from "./saveables/menu";
import {CommandManager} from "./managers/command";
import {Student} from "./saveables/student";
import {PurdueModal} from "./modals/purdue.modal";
import {Verifier} from "./verifier";
import {LeaveEmbed} from "./embeds/leave.embed";
import {JoinEmbed} from "./embeds/join.embed";
import {BanEmbed} from "./embeds/ban.embed";
import {PuggApi} from "./services/pugg.api";
import {LftPlayer} from "./saveables/lft.player";
import {LfpTeam} from "./saveables/lfp.team";
import {MenuSetupComponents} from "./components/menu/menu.setup.components";
import {MenuContentModal} from "./modals/menu/menu.content.model";
import {MenuEmbedModal} from "./modals/menu/menu.embed.modal";
import {MenuComponentSelectComponents} from "./components/menu.component.select.components";
import {MenuEmbedsSelectComponents} from "./components/menu/menu.embeds.select.components";
import {MenuComponentsSelectComponents} from "./components/menu/menu.components.select.components";
import {PurdueDirectory} from "./services/purdue.directory";
import {WallyballModal} from "./modals/wallyball.modal";
import {Player} from "./saveables/player";
import {QueueManager} from "./managers/queue";
import {QueueEmbed} from "./embeds/queue.embed";
import {Team} from "./saveables/team";
import {TeamEmbed} from "./embeds/team.embed";
import {GameRecordModal} from "./modals/game.record.modal";
import {Game} from "./saveables/game";
import {GameEmbed} from "./embeds/game.embed";
import {LeaderboardImage} from "./images/leaderboard.image";
import {LeaderboardComponent} from "./components/leaderboard.component";
import {QueueComponent} from "./components/queue.component";

export class ServerClient extends Client {
    public server: Server;

    constructor(options: ClientOptions, server: Server) {
        super(options);
        this.server = server;
        this.registerEvents();
        this.login(server.settings.token)
            .catch(async (error) => {
                await this.error(error, "Login Event Failed");
            });
    }

    private registerEvents() {
        this.on(Events.ClientReady, async () => {
            await this.ready();
        });

        this.on(Events.MessageCreate, async (message) => {
            await this.message(message);
        });

        this.on(Events.InteractionCreate, async (interaction) => {
            await this.interaction(interaction);
        });

        this.on(Events.GuildMemberAdd, async (member) => {
            await this.memberAdd(member);
        })

        this.on(Events.GuildMemberRemove, async (member) => {
            await this.memberRemove(member);
        })

        this.on(Events.GuildAuditLogEntryCreate, async (entry) => {
            await this.auditLogEntryCreate(entry);
        })
    }

    private async load() {
        try {
            await CommandManager.loadServerCommands(this);
        } catch (error: any) {
            await this.error(error as Error, "Loading Failed");
            setTimeout(this.load, 5 * 60 * 1000);
        }
    }

    private async ready() {
        await this.load();
    }

    private async interaction(interaction: Interaction) {
        try {
            const member = interaction.member;
            const channel = interaction.channel;

            if (!(member instanceof GuildMember)) {
                throw new NotFoundError(`GuildMember Not Found\nMember: ${member}`);
            }

            if (!channel) {
                throw new NotFoundError(`Channel Not Found`);
            }

            const guild = member.guild;
            const adminRoles = this.server.settings.roles.admins;
            const isAdmin = member.roles.cache.some(role => adminRoles.some(adminRole => role.id == adminRole));

            if (interaction.isButton()) {
                const customId = interaction.customId;
                const args = customId.split("-");

                if (args[0] == "menu") {
                    const menuName = args[3];
                    const menu = await Menu.fetch(menuName, guild.id);
                    if (!menu) throw new NotFoundError(`Menu Not Found\nName: ${menuName}`)
                    if (args[1] == "add") {
                        if (args[2] == "embed") {
                            if (menu.embeds.length == 5) await interaction.reply({ content: "Sorry, the maximum total embeds is 5.", ephemeral: true});
                            else await interaction.showModal(new MenuEmbedModal(menu));
                        }
                        if (args[2] == "component") {
                            if (menu.components.length == 5) await interaction.reply({ content: "Sorry, the maximum total components is 5.", ephemeral: true});
                            else await interaction.reply({ components: [ new MenuComponentSelectComponents(menuName) ], ephemeral: true });
                        }
                    }
                    if (args[1] == "edit") {
                        if (args[2] == "content") {
                            await interaction.showModal(new MenuContentModal(menu));
                        }
                        if (args[2] == "embed") {
                            if (menu.embeds.length < 1) await interaction.reply({ content: "Sorry, there are no embeds to edit yet.", ephemeral: true });
                            else await interaction.reply({ components: [ new MenuEmbedsSelectComponents(menu) ], ephemeral: true });
                        }
                        if (args[2] == "component") {
                            if (menu.components.length < 1) await interaction.reply({ content: "Sorry, there are no components to edit yet.", ephemeral: true });
                            else await interaction.reply({ components: [ new MenuComponentsSelectComponents(menu) ], ephemeral: true });
                        }
                    }
                    if (args[1] == "render") {
                        if (args[2] == "all") {
                            await interaction.reply({ content: menu.content, embeds: menu.embeds, components: menu.components, ephemeral: true });
                        }
                    }
                    if(args[1] == "delete") {
                        if (args[2] == "content") {
                            menu.content = "";
                            await menu.save();
                            await interaction.reply({ content: "Content deleted.", ephemeral: true });
                        }
                        if (args[2] == "embed") {
                            const index = Number.parseInt(args[4]);

                        }
                        if (args[2] == "component") {
                            const index = Number.parseInt(args[4]);
                        }
                    }
                    return;
                }

                if (args[0] == "leaderboard") {
                    const component = new LeaderboardComponent(0, [  ], true);
                    await interaction.update({ components: [ component ] });
                    const page = Number.parseInt(args[1]);
                    const players = await PuggApi.fetchAllPlayers();
                    const leaderboard = new LeaderboardImage(page);
                    const attachment = await leaderboard.draw(guild, players);
                    const actionRow = new LeaderboardComponent(page, players, false);
                    await interaction.editReply({ components: [ actionRow ], files: [ attachment ] });
                    return;
                }

                if (args[0] == "wallyball") {

                    if (!isAdmin) {
                        await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
                        return;
                    }

                    if (args[1] == "add") {
                        const actionRow = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
                            new UserSelectMenuBuilder()
                                .setCustomId("wallyball-add")
                                .setPlaceholder("Select all the players you want to add.")
                                .setMaxValues(20)
                        );
                        await interaction.reply({ components: [ actionRow ], ephemeral: true });
                    }
                    if (args[1] == "remove") {
                        const selectMenu = new StringSelectMenuBuilder().setCustomId("wallyball-remove").setPlaceholder("Select all the players you want to remove.");
                        const players = QueueManager.queue.getPlayers();
                        for (const player of players) {
                            selectMenu.addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setValue(player.id)
                                    .setLabel(`${player.firstName} ${player.lastName.charAt(0)}`)
                                    .setDescription(player.username)
                            )
                        }
                        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                            selectMenu
                        );
                        await interaction.reply({ components: [ actionRow ], ephemeral: true });
                    }
                    if (args[1] == "clear") {
                        QueueManager.queue.clear();
                        const embed = new QueueEmbed("The queue has been cleared.", Colors.White, QueueManager.queue);
                        const component = new QueueComponent(QueueManager.queue);
                        await interaction.update({ content: `<@${member.id}> has updated the queue.`, embeds: [ embed ], components: [ component ] });
                    }
                    if (args[1] == "generate") {
                        const queueSize = QueueManager.queue.size;

                        if (queueSize < 2) {
                            await interaction.reply({ content: "Sorry, you need at least 2 players to generate teams", ephemeral: true});
                            return;
                        }

                        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
                        const selectMenu = new StringSelectMenuBuilder().setCustomId("wallyball-generate").setMaxValues(1)
                        for (let i = 2; i <= queueSize; i++) {
                            selectMenu.addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel(`${String(i)} Teams`)
                                    .setValue(String(i))
                            )
                        }
                        actionRow.addComponents(selectMenu);
                        await interaction.reply({ components: [ actionRow ], ephemeral: true });
                    }
                    return;
                }

                const role = await guild.roles.fetch(customId);

                if (role) {
                    if (member.roles.cache.has(role.id)) {
                        if (role.id == this.server.settings.roles.member) await interaction.reply({ content: "You already have this role!", ephemeral: true });
                        else if (role.id == this.server.settings.roles.purdue) await interaction.reply({ content: "You are verified!", ephemeral: true });
                        else {
                            await member.roles.remove(role.id);
                            await interaction.reply({ content: `You removed **<@&${role.id}>**.`, ephemeral: true });
                        }
                        return;
                    } else {
                        if (role.id == this.server.settings.roles.member) {
                            await member.roles.add(role.id);
                            await interaction.reply({content: "Thank you, and welcome to the Server!", ephemeral: true});
                        }
                        else if (role.id == this.server.settings.roles.purdue) {
                            const student = await Student.fetch(member.id);
                            if (student?.verified) {
                                await member.roles.add(role.id);
                                await interaction.reply({content: `You are verified. Thank you!`, ephemeral: true});
                            } else {
                                const modal = new PurdueModal();
                                await interaction.showModal(modal);
                            }
                        }
                        else if (role.id == this.server.settings.roles.wallyball) {
                            const student = await Student.fetch(member.id);
                            const player = await Player.fetch(member.id);
                            if (player) {
                                await member.roles.add(role.id);
                                await interaction.reply({ content: `You applied **<@&${role.id}>**.`, ephemeral: true });
                            } else {
                                if (student?.verified) {
                                    const name = await PurdueDirectory.getNameFromAddress(student.email);
                                    if (name) {
                                        const firstName = name[0];
                                        const lastName = name[name.length - 1];
                                        await Player.newInstance(member.id, firstName, lastName, member.user.username).save();
                                        await interaction.reply({content: `You have been registered as ${firstName} ${lastName.charAt(0)}. If you prefer a different name please use /wb nick. Thank you!`, ephemeral: true});
                                    } else {
                                        await interaction.showModal(new WallyballModal());
                                    }
                                } else {
                                    await interaction.showModal(new WallyballModal());
                                }
                            }
                        }
                        else {
                            await member.roles.add(role.id);
                            await interaction.reply({ content: `You applied **<@&${role.id}>**.`, ephemeral: true });
                        }
                        return;
                    }
                } else {
                    await interaction.reply({ content: "Sorry, this is a legacy role and cannot be applied.", ephemeral: true });
                    return;
                }

            }

            if (interaction.isStringSelectMenu()) {
                const customId = interaction.customId;
                const args = customId.split("-");

                if (args[0] == "menu") {
                    const menuName = args[3];
                    const menu = await Menu.fetch(menuName, guild.id);
                    if (!menu) throw new NotFoundError(`Menu Not Found\nName: ${menuName}`)
                    if (args[1] == "add") {
                        if (args[2] == "component") {
                            if (interaction.values[0] == "button") {
                                const actionRow = new ActionRowBuilder<ButtonBuilder>().toJSON();
                                menu.components.push(actionRow);
                                await menu.save();
                                await interaction.reply({ content: "Button Row Added!", ephemeral: true});
                            }
                            if (interaction.values[0] == "select") {
                                const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
                                    .addComponents(
                                        new StringSelectMenuBuilder()
                                            .setCustomId(`component-${menu.components.length}-${menu.name}`)
                                    )
                                    .toJSON();
                                menu.components.push(actionRow);
                                await menu.save();
                                await interaction.reply({ content: "Drop Down Menu Added!", ephemeral: true});
                            }
                        }
                    }
                    if (args[1] == "edit") {
                        const index = Number.parseInt(interaction.values[0]);
                        if (args[2] == "embed") {
                            await interaction.showModal(new MenuEmbedModal(menu, index));
                        }
                        if (args[2] == "component") {

                        }
                    }
                    return;
                }
                else if (args[0] == "setup") {
                    const menuName = interaction.values[0];
                    const menu = await Menu.fetch(menuName, guild.id);
                    if (!menu) throw new NotFoundError(`Menu Not Found\nMenuName: ${menuName}`)
                    const components = new MenuSetupComponents()
                    await interaction.reply({ content: "Success!", ephemeral: true });
                    //await interaction.channel.send({ components: components });
                    return;
                }
                else if (args[0] == "wallyball") {
                    if (args[1] == "remove") {
                        await interaction.deferUpdate();
                        const messages = [  ]
                        const playerIds = interaction.values;
                        for (const playerId of playerIds) {
                            const player = QueueManager.queue.get(playerId) as Player;
                            QueueManager.queue.delete(playerId);
                            messages.push(player.username);
                        }
                        const message = `Removed ${messages.join(", ")}`;
                        const embed = new QueueEmbed(message, Colors.DarkOrange, QueueManager.queue);
                        const component = new QueueComponent(QueueManager.queue);
                        if (interaction.message.reference?.messageId) {
                            await interaction.channel.messages.edit(interaction.message.reference.messageId,
                                { content: `<@${member.id}> has updated the queue.`, embeds: [ embed ], components: [ component ]  }
                            );
                        } else {
                            await interaction.channel.send({ content: `<@${member.id}> has updated the queue.`, embeds: [ embed ], components: [ component ]  });
                        }

                    }
                    if (args[1] == "generate") {
                        await interaction.deferUpdate();
                        await interaction.channel.send({ content:  `<@${member.id}> has generated new teams!` });
                        const totalTeams = Number.parseInt(interaction.values[0]);
                        const players = QueueManager.queue.getPlayers();
                        const teams = [  ] as Team[];
                        for (let i = 0; i < totalTeams; i++) {
                            const team = await Team.create();
                            teams.push(team);
                        }
                        for (let i = 0; i < players.length; i++) {
                            const player = players[i];
                            teams[i % totalTeams].players.push(player);
                        }
                        for (let i = 0; i < totalTeams; i++) {
                            const players = teams[i].players;
                            const totalElo = players.map(player => player.stats.elo).reduce((a, b) => a + b);
                            const totalPlayers = players.length;
                            teams[i].stats.elo = totalElo / totalPlayers;
                            await teams[i].save();
                        }
                        for (let i = 0; i < totalTeams; i += 5) {
                            const embeds = [  ];
                            for (let j = i; j < totalTeams; j++) {
                                const embed = new TeamEmbed(teams[j]);
                                embeds.push(embed);
                            }
                            await interaction.channel.send({ embeds: embeds });
                        }
                    }
                    if (args[1] == "record") {
                        if (!isAdmin) {
                            await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
                            return;
                        }
                        if (args[2] == "1") {
                            const teamOneName = interaction.values[0];
                            const teams = await Team.fetchAll();
                            const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
                            const selectMenu = new StringSelectMenuBuilder()
                                .setCustomId(`wallyball-record-2-${teamOneName}`)
                                .setPlaceholder("Pick the second team")
                                .setMaxValues(1);
                            for (let i = 0; i < teams.length && i < 5; i++) {
                                const team = teams[i];
                                if (team.name == teamOneName) continue;
                                const playerNames = team.players.map(player => player.username);
                                selectMenu.addOptions(
                                    new StringSelectMenuOptionBuilder()
                                        .setValue(team.name)
                                        .setLabel(`The ${team.properName}`)
                                        .setDescription(playerNames.join(", "))
                                );
                            }
                            actionRow.addComponents(selectMenu);
                            await interaction.reply({ components: [ actionRow ], ephemeral: true });
                        }
                        if (args[2] == "2") {
                            const teamOne = await PuggApi.fetchTeam(args[3]) as Team;
                            const teamTwo = await PuggApi.fetchTeam(interaction.values[0]) as Team;
                            const modal = new GameRecordModal(teamOne, teamTwo);
                            await interaction.showModal(modal);
                        }
                    }
                    return;
                }
                else {
                    const roleId = interaction.values[0];
                    const role = await guild.roles.fetch(roleId);
                    const member = interaction.member as GuildMember;
                    if (role) {
                        await interaction.update({ components: interaction.message.components });
                        if (member.roles.cache.has(role.id)) {
                            if (role.id == this.server.settings.roles.member) await interaction.followUp({ content: "You already have this role!", ephemeral: true });
                            else {
                                await member.roles.remove(role.id);
                                await interaction.followUp({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
                            }
                            return;
                        } else {
                            await member.roles.add(role.id);
                            await interaction.followUp({content: `You applied **<@&${role.id}>**.`, ephemeral: true});
                            return;
                        }
                    }
                }

                throw new NotFoundError(`StringSelectMenu Not Found\nCustomId: ${customId}`);
            }

            if (interaction.isUserSelectMenu()) {
                const customId = interaction.customId;
                const args = customId.split("-");

                if (args[0] == "wallyball") {
                    await interaction.deferUpdate();
                    const playerIds = interaction.values;
                    const players = await Promise.all(playerIds.map(id => Player.fetch(id)));
                    const mentions = [  ];
                    for (let i = 0; i < players.length; i++) {
                        const player = players[i];
                        if (!player) {
                            await interaction.followUp({ content: `Could Not Add <@${playerIds[i]}>.`, ephemeral: true });
                            continue;
                        }
                        if (QueueManager.queue.has(player.id)) {
                            await interaction.followUp({ content: `${player.username} is already in the queue.`, ephemeral: true });
                            continue;
                        }
                        mentions.push(player.username);
                        QueueManager.queue.set(player.id, player);
                    }
                    const message = `Added ${mentions.join(", ")}`;
                    const embed = new QueueEmbed(message, Colors.DarkGreen, QueueManager.queue);
                    const component = new QueueComponent(QueueManager.queue);
                    if (interaction.message.reference?.messageId) {
                        await interaction.channel.messages.edit(interaction.message.reference.messageId,
                            { content: `<@${member.id}> has updated the queue.`, embeds: [ embed ], components: [ component ] }
                        );
                    } else {
                        await interaction.channel.send({ content: `<@${member.id}> has updated the queue.`, embeds: [ embed ], components: [ component ] });
                    }
                    return;
                }

                throw new NotFoundError(`UserSelectMenu Not Found\nCustomId: ${customId}`);
            }

            if (interaction.isRoleSelectMenu()) {
                const customId = interaction.customId;
                const args = customId.split("-");

                /*
                if (args[0] == "menu") {
                    const menuName = args[1];
                    const row = Number.parseInt(args[2]);
                    const column = Number.parseInt(args[3]);
                    const roleId = interaction.values[0];
                    const role = interaction.roles.get(roleId);
                    const menu = await Menu.fetch(menuName, guild.id);
                    const button = menu.buttons[row][column];
                    if (!button) menu.buttons[row][column] = MenuButton.create(role as Role);
                    else menu.buttons[row][column].id = roleId;
                    await menu.save();
                    await interaction.deferUpdate()
                    return;
                }
                 */


                throw new NotFoundError(`RoleSelectMenu Not Found\nCustomId: ${customId}`);
            }

            if (interaction.isModalSubmit()) {
                const customId = interaction.customId;
                const args = customId.split("-");

                if (args[0] == "confirm") {
                    const input = interaction.fields.getTextInputValue("confirm");
                    if (input.toLowerCase() != "confirm") {
                        await interaction.reply({ content: "This action has been cancelled.", ephemeral: true });
                        return;
                    }
                    if (args[1] == "wallyball") {
                        if (args[2] == "reset") {
                            const players = await PuggApi.fetchAllPlayers();
                            for (const player of players) {
                                player.stats.elo = 350;
                                player.stats.wins = 0;
                                player.stats.losses =  0;
                                player.stats.points = 0;
                                await player.save();
                            }
                            await interaction.channel.send({ content: `<@${member.id} has reset everyone's Valoball stats!` });
                        }

                        return;
                    }
                }

                if (args[0] == "purdue") {
                    const email = interaction.fields.getTextInputValue("email");
                    try {
                        await interaction.reply({content: `A Verification Email will be sent to \`${email}\`.`, ephemeral: true});
                        await Verifier.registerNewStudent(member, email, interaction);
                        await interaction.followUp({content: `A Verification Email has been sent to \`${email}\`.`, ephemeral: true});
                    } catch (error) {
                        if (error instanceof InvalidAddressError) {
                            await interaction.followUp({content: `Sorry, the address you provided, \`${email}\`, is invalid. Please provide a valid Purdue address.`, ephemeral: true});
                        } else {
                            await this.error(error as Error, "Registration Failed");
                        }
                    }
                    return;
                }

                if (args[0] == "wallyball") {
                    if (args[1] == "register") {
                        const firstName = interaction.fields.getTextInputValue("firstName");
                        const lastName = interaction.fields.getTextInputValue("lastName");
                        await Player.newInstance(member.id, firstName, lastName, member.user.username).save();
                        await member.roles.add(this.server.settings.roles.wallyball);
                        await interaction.reply({content: `You have been registered as ${firstName} ${lastName.charAt(0)}. If you prefer a different name please use /wb nick`, ephemeral: true });
                    }

                    if (args[1] == "record") {
                        await interaction.deferUpdate();
                        const teamOne = await Team.fetch(args[2]) as Team;
                        const teamTwo = await Team.fetch(args[3]) as Team;
                        const teamOneScore = Number.parseInt(interaction.fields.getTextInputValue("teamOneScore"));
                        const teamTwoScore = Number.parseInt(interaction.fields.getTextInputValue("teamTwoScore"));
                        const game = await Game.record(teamOne, teamTwo, teamOneScore, teamTwoScore);
                        const embed = new GameEmbed(game);
                        await interaction.channel.send({ content: `<@${member.id}> has recorded a new game!`, embeds: [embed] });
                    }

                    return;
                }

                if (args[0] == "lft") {
                    const username = member.user.username;
                    const experience = interaction.fields.getTextInputValue("experience");
                    const hours = interaction.fields.getTextInputValue("hoursAvailable");
                    const roles = interaction.fields.getTextInputValue("roles");
                    const year = interaction.fields.getTextInputValue("academicYear");
                    const other = interaction.fields.getTextInputValue("otherInfo");
                    const player = await PuggApi.fetchLftPlayer(member.id);
                    const content = "Output {\n" +
                        `\t**Username**: ${username}\n\t**Experience**: ${experience}\n\t**Hours Available**: ${hours}\n` +
                        `\t**Roles**: ${roles}\n\t**Year**: ${year}\n\t**Other Info**: ${other}\n` +
                        "}"

                    if (!player) {
                        const player = new LftPlayer(member.id, 0, username, experience, hours, roles, year, other);
                        await PuggApi.createLftPlayer(player);
                        await interaction.reply({ content: content, ephemeral: true });
                    }
                    else {
                        player.name = username;
                        player.experience = experience;
                        player.hours = hours;
                        player.roles = roles;
                        player.year = year;
                        player.other = other;
                        await PuggApi.updateLftPlayer(player);
                        await interaction.reply({ content: content, ephemeral: true });
                    }
                    return;
                }

                if (args[0] == "lfp") {
                    const teamName = args[1];
                    const experience = interaction.fields.getTextInputValue("experience");
                    const hours = interaction.fields.getTextInputValue("hoursAvailable");
                    const roles = interaction.fields.getTextInputValue("roles");
                    const year = interaction.fields.getTextInputValue("academicYear");
                    const other = interaction.fields.getTextInputValue("otherInfo");
                    const team = await PuggApi.fetchLfpTeam(teamName);
                    const content = "Output {\n" +
                        `\t**Team Name**: ${teamName}\n\t**Experience**: ${experience}\n\t**Hours Available**: ${hours}\n` +
                        `\t**Roles**: ${roles}\n\t**Year**: ${year}\n\t**Other Info**: ${other}\n` +
                    "}"

                    if (!team) {
                        const team = new LfpTeam(member.id, 0, teamName, experience, hours, roles, year, other);
                        await PuggApi.createLfpTeam(team);
                        await interaction.reply({ content: content, ephemeral: true });
                    } else {
                        if (team.ownerId != member.id) {
                            await interaction.reply({ content: "Sorry, a team with this name already exists.", ephemeral: true });
                        } else {
                            team.experience = experience;
                            team.hours = hours;
                            team.roles = roles;
                            team.year = year;
                            team.other = other;
                            await PuggApi.updateLfpTeam(team);
                            await interaction.reply({ content: content, ephemeral: true });
                        }
                    }
                    return;
                }

                if (args[0] == "menu") {
                    const menuName = args[3];
                    const menu = await Menu.fetch(menuName, guild.id);
                    if (!menu) throw new NotFoundError("Menu Not Found")
                    if (args[1] == "add") {
                        if (args[2] == "content") {
                            menu.content = interaction.fields.getTextInputValue("content");
                            await menu.save();
                            await interaction.reply({ content: "Content successfully set.", ephemeral: true });
                        }
                        if (args[2] == "embed") {
                            const embed = new EmbedBuilder();
                            try {
                                const title = interaction.fields.getTextInputValue("title");
                                embed.setTitle(title);
                                try {
                                    const description = interaction.fields.getTextInputValue("description");
                                    embed.setDescription(description);
                                } catch {  }
                            } catch {
                                try {
                                    const description = interaction.fields.getTextInputValue("description");
                                    embed.setDescription(description);

                                } catch {
                                    await interaction.reply({ content: "At least one of title or description must be non-null", ephemeral: true });
                                    return;
                                }
                            }
                            try {
                                const color = interaction.fields.getTextInputValue("color");
                                embed.setColor(color as HexColorString);
                            } catch {  }
                            menu.embeds.push(embed.toJSON());
                            await menu.save();
                            await interaction.reply({ content: "Embed successfully added.", ephemeral: true });
                        }
                    }
                    if (args[1] == "edit") {
                        if (args[2] == "content") {

                        }
                        if (args[2] == "embed") {

                        }
                    }
                    return;
                }

                throw new NotFoundError(`ModalSubmit Not Found\nCustomId: ${customId}`);
            }

            if (interaction.isChatInputCommand()) {
                const commandName = interaction.commandName;
                const command = CommandManager.fetchCommand(commandName);
                if (command.restricted && !isAdmin) {
                    await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
                    return;
                }
                await command.execute(interaction);
                return;
            }
        } catch (error: any) {
            await this.error(error, "Interaction Event Failed");
            try {
                if (interaction.isRepliable()) {
                    if (interaction.replied) {
                        await interaction.followUp({ content: `An error occurred and has been logged.\n${error.message}`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: `An error occurred and has been logged.\n${error.message}`, ephemeral: true });
                    }
                }
            } catch {
                const channel = interaction.channel;
                if (channel) {
                    const message = await interaction.channel.send({ content: `<@${interaction.user.id}> an error occurred and has been logged.` });
                    setTimeout((message) => message.delete(), 5000, message);
                }
            }
        }
    }

    private async message(message: Message) {
        if (message.channelId == "1143326543351910470") {
            if (!message.author.bot) {
                try {
                    setTimeout(() => {
                        message.delete();
                    }, 1000);
                } catch {  }
            }
        }
    }

    private async memberAdd(member: GuildMember) {
        const guild = await this.guilds.fetch(this.server.id);
        const channel = await guild.channels.fetch(this.server.settings.channels.join) as TextChannel;
        await channel.send({  content: `${member.user}`, embeds: [ new JoinEmbed(member) ] });
        const student = await Student.fetch(member.id);
        if (student && student.verified) {
            await member.roles.add(this.server.settings.roles.member);
            await member.roles.add(this.server.settings.roles.purdue);
        }
    }

    private async memberRemove(member: GuildMember | PartialGuildMember) {
        const guild = await this.guilds.fetch(this.server.id);
        const channel = await guild.channels.fetch(this.server.settings.channels.leave) as TextChannel;
        const embed = new LeaveEmbed(member);
        await channel.send({embeds: [embed]});
    }

    private async auditLogEntryCreate(entry: GuildAuditLogsEntry) {
        if (entry.action != AuditLogEvent.MemberBanAdd && entry.action != AuditLogEvent.MemberBanRemove) return;
        const guild = await this.guilds.fetch(this.server.id);
        const channel = await guild.channels.fetch(this.server.settings.channels.admin) as TextChannel;
        await channel.send({ embeds: [ new BanEmbed(entry as GuildAuditLogsEntry<AuditLogEvent.MemberBanAdd | AuditLogEvent.MemberBanRemove>) ]} );
    }

    private async error(error: Error, title: string) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(`\`\`\`${error?.stack as string}\`\`\``)
            .setTimestamp(new Date())
            .setColor(Colors.Red)
            .toJSON();

        const headers = {
            "Authorization": `Bot ${this.token}`,
            "Content-Type": `application/json`,
        };

        await axios.post(
            `https://discord.com/api/channels/${this.server.settings.channels.log}/messages`,
            {
                embeds: [
                    embed
                ]
            },
            {
                headers: headers
            }
        );
    }
}