import RoleUtils from "../utils/RoleUtils";
import ModAlert from "./ModAlert";
import Properties from "./Properties";

import {AttachmentBuilder, ButtonInteraction, GuildMember, Message, TextChannel, ThreadChannel, User} from "discord.js";

export default class QuickMute {
    public static async quickMuteUser(moderator: User, authorId: string, duration: string, messageEvidence: string, commandsChannel: TextChannel, message: Message | null) {
        const member = await commandsChannel.guild.members.fetch(authorId).catch(() => {
            console.log("Member has left the server")
        });

        if (!member) {
            if (message) message.delete().catch(console.error);
            await commandsChannel.send(`<@${moderator.id}> user <@${authorId}> (${authorId}) has left the server!`)
            return;
        }

        if (RoleUtils.hasAnyRole(member, [
            RoleUtils.roles.trialModerator,
            RoleUtils.roles.moderator,
            RoleUtils.roles.seniorModerator,
            RoleUtils.roles.manager,
            RoleUtils.roles.bot
        ])) {
            await commandsChannel.send(`${moderator} Oops! You can't Quick Mute another moderator. (Nice try though)`)
            return;
        }

        if (message) message.delete().catch(console.error);
        const evidence = messageEvidence.replace(/\r?\n|\r/g, " ");

        if (evidence.length < 120) {
            await commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${evidence}`);
            return;
        }

        let memberTitle = authorId;
        if (member.nickname) memberTitle = `${member.nickname}_${authorId}`;

        const currentDate = new Date().toISOString();
        const evidenceFile = new AttachmentBuilder(Buffer.from(messageEvidence), {
            name: `Evidence_against_${memberTitle}_on_${currentDate}}.txt`
        });

        const messagePreview = messageEvidence.substring(0, 25) + "...";

        const messageLogs = await commandsChannel.guild.channels.fetch(Properties.channels.messageLogs) as TextChannel;

        if (!messageLogs) {
            commandsChannel.send({
                files: [evidenceFile]
            }).then(message => {
                const attachment = message.attachments.first();
                if (attachment?.url) {
                    commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${messagePreview} Full Evidence: ${attachment.url}`)
                }
            }).catch(console.error);

            return;
        }

        messageLogs.send({
            files: [evidenceFile]
        }).then(message => {
            const attachment = message.attachments.first();
            if (attachment?.url) {
                commandsChannel.send(`;mute ${authorId} ${duration} (By ${moderator.tag} (${moderator.id})) Message Evidence: ${messagePreview} Full Evidence: ${attachment.url}`)
            }
        }).catch(console.error)
    }

    public static async purgeMessagesFromUserInChannel(channel: TextChannel, member: GuildMember, moderator: GuildMember) {
        const commandsChannel = await channel.guild.channels.fetch(Properties.channels.commands) as TextChannel;

        try {
            if (RoleUtils.hasAnyRole(member, [
                RoleUtils.roles.bot,
                RoleUtils.roles.trialModerator,
                RoleUtils.roles.moderator,
                RoleUtils.roles.seniorModerator,
                RoleUtils.roles.manager
            ])) {
                await commandsChannel.send(`${moderator} Oops! You can't Sweep another moderator. (Nice try though)`);
                return;
            }

            let messagesToBePurged: Message[] = [];
            let evidence = `Messages by ${member.user.tag} (${member.id}) purged in #${channel.name} (${channel.id})\n\n`;

            const messages = await channel.messages.fetch({limit: 100})

            messages.forEach(message => {
                if (message.author.id == member.id) {
                    messagesToBePurged.push(message);
                    evidence += `[${message.createdAt.toLocaleString("en-US")}] ${message.content}\n`;
                }
            });

            const messageCount = messagesToBePurged.length;
            if (messageCount == 0) return;

            evidence = `${messageCount} ${evidence}`;
            await channel.bulkDelete(messagesToBePurged);

            const currentTime = new Date().toISOString();
            const evidenceFile = new AttachmentBuilder(Buffer.from(evidence), {
                name: `Evidence_against_${member.id}_on_${currentTime}}.txt`
            });

            const messageLogs = await channel.guild.channels.fetch(Properties.channels.messageLogs) as TextChannel;

            const log = await messageLogs.send({files: [evidenceFile]});
            const attachment = log.attachments.first();

            if (attachment?.url) {
                await commandsChannel.send(`${moderator} - You swept messages by ${member} (${member.id})`
                    + `\n> <:sweep:${Properties.emojis.sweep}> ${messageCount} messages deleted in ${channel}`
                    + `\n\n**Message Evidence:** ${attachment.url}`)
            }

            if (RoleUtils.hasRole(moderator, RoleUtils.roles.trialModerator)) {
                const logThreadParent = await channel.guild.channels.fetch(Properties.channels.moderators) as TextChannel;
                const logThread = await logThreadParent.threads.fetch(Properties.threads.trialLogs) as ThreadChannel;

                await logThread.send(`<:sweep:${Properties.emojis.sweep}> **${moderator.user.tag}** (\`${moderator.id}\`) has swept \`${messageCount}\` messages by **${member.user.tag}** (\`${member.id}\`) in ${channel} (\`#${channel.name}\`)\n${log.url}`);
            }
        } catch (error) {
            console.error(error);
            await commandsChannel.send(`${moderator} An error has occurred while trying to purge the messages! Please contact a member of infrastructure if this keeps happening`);
        }
    }

    public static async quickMuteFromButton(interaction: ButtonInteraction, duration: string) {
        const modAlertMessage = interaction.message as Message;
        const authorId = modAlertMessage.content.split("`")[3];
        const channelId = modAlertMessage.content.split("/")[5];
        const messageId: string = modAlertMessage.content.split("/")[6].replace(/\D/g, '');

        const commandsChannel = await interaction.guild?.channels.fetch(Properties.channels.commands) as TextChannel;
        const originChannel = await interaction.guild?.channels.fetch(channelId) as TextChannel;
        const messageEvidence = ModAlert.existingModAlerts.get(messageId);

        originChannel.messages.fetch(messageId).then(message => {
            if (messageEvidence) {
                this.quickMuteUser(interaction.user, authorId, duration, messageEvidence, commandsChannel, message);
                ModAlert.deleteModAlert(messageId, modAlertMessage, null);
            } else {
                this.quickMuteUser(interaction.user, authorId, duration, message.content, commandsChannel, message);
                commandsChannel.send(`${interaction.user} Please verify the following Quick Mute. The message was not cached; it could have been edited.`);
                ModAlert.deleteModAlert(messageId, modAlertMessage, null);
            }
        }).catch(err => {
            if (messageEvidence) {
                this.quickMuteUser(interaction.user, authorId, duration, messageEvidence, commandsChannel, null);
                ModAlert.deleteModAlert(messageId, modAlertMessage, null);
            } else {
                console.log(ModAlert.existingModAlerts)
                console.error(err);

                commandsChannel.send(`${interaction.user} The message was deleted and not cached! Please mute manually`);
                ModAlert.deleteModAlert(messageId, modAlertMessage, null);
            }
        }).catch(console.error);
    }
}