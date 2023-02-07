import Properties from "./Properties";

import {
    GuildMember,
    TextChannel,
    Message,
    MessageButton,
    MessageActionRow
} from "discord.js";
import RoleUtils from "./RoleUtils";

export default class BanRequest {
    public static approveBanRequest(message: Message, commandChannel: TextChannel, moderator: GuildMember) {
        try {
            let banRequestContent: string[] = message.content
                .replaceAll("(?i)(?!_(\\w|\\d|-)+\\.(png|jpe?g|gifv?|webm|wav|mp[34]|ogg|mov|txt)+)[\\*\\|\\~\\`\\_\\>]", "")
                .replaceAll("\\s+", " ")
                .split(" ");

            let actionAuthor = `(approved by ${moderator.user.tag} (${moderator.id})) `;

            for (let i = 2; i < banRequestContent.length; i++) {
                actionAuthor += banRequestContent[i] + " ";
            }

            const evidence = actionAuthor.replaceAll('|', '').toString();
            const userToBan = banRequestContent[1];

            if (
                banRequestContent[0].toLowerCase() === ";ban" ||
                banRequestContent[0].toLowerCase() === ";forceban"
            ) {
                commandChannel.send(`;ban ${userToBan} ${evidence}`).then(message => {
                    message.suppressEmbeds(true)
                });
            } else {
                commandChannel.send(`${moderator} the ban you tried to invoke was not correctly formatted. Please run the command manually`);
            }
        } catch {
            commandChannel.send(`${moderator} the ban you tried to invoke was not correctly formatted. Please run the command manually`)
        }
    }

    public static rejectBanRequest(message: Message, commandChannel: TextChannel, moderator: GuildMember) {
        try {
            let banRequestContent: string[] = message.content
                .replaceAll("(?i)(?!_(\\w|\\d|-)+\\.(png|jpe?g|gifv?|webm|wav|mp[34]|ogg|mov|txt)+)[\\*\\|\\~\\`\\_\\>]", "")
                .replaceAll("\\s+", " ")
                .split(" ");

            let reportedUserId = banRequestContent[1];
            let rejectionNotice = `${message.author} <:reject:${Properties.emojis.reject}> your ban request against <@${reportedUserId}> (${reportedUserId}) has been rejected by ${moderator} and the user has been unmuted.\n\nYour ban request evidence: `;

            for (let i = 2; i < banRequestContent.length; i++) {
                rejectionNotice += banRequestContent[i] + " ";
            }

            commandChannel.send(`;unmute ${reportedUserId}`);
            commandChannel.send(rejectionNotice);
        } catch {
            commandChannel.send(`${moderator} the ban you tried to invoke was not correctly formatted. Please run the command manually`)
        }
    }

    public static async validate(message: Message) {
        if (
            message.member &&
            !RoleUtils.hasRole(message.member, RoleUtils.roles.moderator)
        ) return;

        const re = new RegExp(";ban (?<userId>\\d{17,19}) \\S+", "gmi");
        const args = re.exec(message.content);

        const deleteMessage = new MessageButton()
            .setCustomId("deleteMessage")
            .setEmoji("🗑️")
            .setStyle("SECONDARY");

        const actionRow = new MessageActionRow().addComponents(deleteMessage);

        if (!args?.groups) {
            await message.reply({
                content: "Invalid format. Please use the following format: `;ban <userId> <reason/proof>`",
                components: [actionRow]
            });
            return;
        }

        const { userId } = args.groups;
        const user = await message.client.users.fetch(userId).catch(async () => {});

        if (!user) {
            await message.reply({
                content: "Unable to resolve the user ID, please double check it",
                components: [actionRow]
            });
            return;
        }

        const member = await message.guild?.members.fetch(user);

        if (member && RoleUtils.hasAnyRole(member, [
            RoleUtils.roles.trialModerator,
            RoleUtils.roles.moderator,
            RoleUtils.roles.seniorModerator,
            RoleUtils.roles.manager,
            RoleUtils.roles.bot
        ])) {
            await message.reply({
                content: "The user ID belongs to a staff member, please double check it",
                components: [actionRow]
            });
            return;
        }
    }
}

