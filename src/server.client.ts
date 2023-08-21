import {
    Client,
    ClientOptions,
    Colors,
    Events,
    EmbedBuilder,
    Interaction,
    GuildMember,
    RoleSelectMenuBuilder,
    ActionRowBuilder,
    Role,
    TextChannel,
    PartialGuildMember,
    AuditLogEvent,
    GuildAuditLogsEntry,
    GuildAuditLogsActionType, GuildAuditLogsTargetType
} from "discord.js";
import {Server} from "./server";
import axios from "axios";
import {InvalidAddressError, NotFoundError} from "./error";
import {ButtonEditComponent} from "./components/button.edit.component";
import {Menu, MenuButton} from "./menu";
import {ButtonStyleComponent} from "./components/button.style.component";
import {ButtonLabelModal} from "./modals/button.label.modal";
import {MenuEditComponents} from "./components/menu.edit.components";
import {CommandManager} from "./command";
import {Student} from "./student";
import {PurdueModal} from "./modals/purdue.modal";
import {Verifier} from "./verifier";
import {LeaveEmbed} from "./embeds/leave.embed";
import {JoinEmbed} from "./embeds/join.embed";
import {BanEmbed} from "./embeds/ban.embed";
import {PuggApi} from "./services/pugg.api";
import {LftPlayer} from "./lft.player";
import {LfpTeam} from "./lfp.team";

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
            const guild = await this.guilds.fetch(this.server.id);
            const logChannel = await guild.channels.fetch(this.server.settings.channels.log) as TextChannel;
            await logChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Client Loaded")
                        .setColor(Colors.Green)
                ]
            })
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
            const guild = interaction.guild;

            if (!(member instanceof GuildMember)) {
                throw new NotFoundError(`GuildMember Not Found\nMember: ${member}`);
            }

            if (!guild) {
                return;
            }

            if (interaction.isButton()) {
                const customId = interaction.customId;
                const args = customId.split("-");

                if (args[0] == "menu") {
                    const buttonEditComponent = new ButtonEditComponent(customId);
                    await interaction.reply({ components: [ buttonEditComponent ], ephemeral: true  });
                    return;
                }
                else {
                    const role = await interaction.guild.roles.fetch(customId);
                    const member = interaction.member as GuildMember;
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
            }

            if (interaction.isStringSelectMenu()) {
                const customId = interaction.customId;
                const args = customId.split("-");

                if (args[0] == "menu") {
                    const menuName = args[1];
                    const row = args[2];
                    const column = args[3];
                    const selectName = args[4];
                    const property = interaction.values[0];
                    const menu = await Menu.fetch(menuName, guild.id);
                    if (selectName == "button") {
                        if (property == "id") {
                            const roleSelectMenu = new RoleSelectMenuBuilder()
                                .setCustomId(customId)
                                .setPlaceholder("Select a Role")
                                .setMaxValues(1);
                            const actionRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelectMenu);
                            await interaction.update({components: [actionRow]});
                        }
                        if (property == "style") {
                            const buttonStyleComponent = new ButtonStyleComponent(customId);
                            await interaction.update({components: [buttonStyleComponent]});
                        }
                        if (property == "label") {
                            const buttonLabelModal = new ButtonLabelModal(customId);
                            await interaction.showModal(buttonLabelModal);
                        }
                        if (property == "emoji") {

                        }
                        return;
                    }
                    if (selectName == "buttonId") {
                        return;
                    }
                    if (selectName == "buttonStyle") {
                        if (property == "primary") {

                        }
                        if (property == "secondary") {

                        }
                        if (property == "success") {

                        }
                        if (property == "success") {

                        }
                        return;
                    }
                }
                else {
                    const roleId = interaction.values[0];
                    const role = await interaction.guild.roles.fetch(roleId);
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

                    throw new NotFoundError(`Button Not Found\nCustomId: ${customId}`);
                }

                throw new NotFoundError(`StringSelectMenu Not Found\nCustomId: ${customId}`);
            }

            if (interaction.isUserSelectMenu()) {
                const customId = interaction.customId;
                const args = customId.split("-");


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

                if (args[0] == "lft") {
                    const username = member.user.username;
                    const experience = interaction.fields.getTextInputValue("experience");
                    const hours = interaction.fields.getTextInputValue("hoursAvailable");
                    const roles = interaction.fields.getTextInputValue("roles");
                    const year = interaction.fields.getTextInputValue("academicYear");
                    const other = interaction.fields.getTextInputValue("otherInfo");
                    const player = await PuggApi.fetchLftPlayer(member.id);

                    if (!player) {
                        const player = new LftPlayer(member.id, 0, username, experience, hours, roles, year, other);
                        await PuggApi.createLftPlayer(player);
                        await interaction.reply({ content: 'Success', ephemeral: true });
                    }
                    else {
                        player.name = username;
                        player.experience = experience;
                        player.hours = hours;
                        player.roles = roles;
                        player.year = year;
                        player.other = other;
                        await PuggApi.updateLftPlayer(player);
                        await interaction.reply({ content: "Success", ephemeral: true });
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

                    if (!team) {
                        const team = new LfpTeam(member.id, 0, teamName, experience, hours, roles, year, other);
                        await PuggApi.createLfpTeam(team);
                        await interaction.reply({ content: 'Success', ephemeral: true });
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
                            await interaction.reply({ content: "Success", ephemeral: true });
                        }
                    }
                    return;
                }

                if (args[0] == "menu") {
                    const menuName = args[1];
                    const row = Number.parseInt(args[2]);
                    const column = Number.parseInt(args[3]);
                    const modalName = args[5];
                    const menu = await Menu.fetch(menuName, guild.id);

                    /*
                    if (modalName == "buttonLabel") {
                        const label = interaction.fields.getTextInputValue("label");
                        const button = menu.buttons[row][column];
                        if (!button) throw new NotFoundError("Button Not Found");
                        button.label = label;
                        menu.buttons[row][column] = button;
                        await menu.save();
                        await interaction.deferUpdate();
                        const reference = await interaction.message?.fetchReference();
                        const menuReference = await reference?.fetchReference();
                        const menuComponents = MenuEditComponents.load(menu);
                        menuReference?.edit({ components: menuComponents });
                        return;
                    }
                     */

                }

                throw new NotFoundError(`ModalSubmit Not Found\nCustomId: ${customId}`);
            }

            if (interaction.isChatInputCommand()) {
                const commandName = interaction.commandName;
                const command = CommandManager.fetchCommand(commandName);
                await command.execute(interaction);
                return;
            }
        } catch (error: any) {
            await this.error(error, "Interaction Event Failed");
            try {
                if (interaction.isRepliable()) {
                    if (interaction.replied) {
                        await interaction.reply({ content: `An error occurred and has been logged.\n${error.message}`, ephemeral: true });
                    } else {
                        await interaction.followUp({ content: `An error occurred and has been logged.\n${error.message}`, ephemeral: true });
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