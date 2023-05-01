import Properties from "./Properties";

import {ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember, Message, TextChannel} from "discord.js";
import RoleUtils from "./RoleUtils";

export default class Requests {
    public static async approveRequest(message: Message, commandChannel: TextChannel, moderator: GuildMember, reqType: RequestType) {
        try {
            let insertPos = 2;
            const reqArgs = message.content
                .replace(/(?!_(\w|\d|-)+\.(png|jpe?g|gifv?|webm|wav|mp[34]|ogg|mov|txt)+)[*|~`_>]/gi, "")
                .replace(/\s+/, " ")
                .split(" ");

            if (reqArgs[2].match(/^\d{1,2}[mhd]$/gi) && reqType === RequestType.Mute) insertPos = 3;
            reqArgs.splice(insertPos, 0, `(approved by ${moderator.user.tag} (${moderator.id}))`);

            if (reqArgs[0] !== `;${reqType}`) {
                await commandChannel.send(`${moderator} the ${reqType} you tried to invoke was not correctly formatted. Please run the command manually`);
                return;
            }

            commandChannel.send(reqArgs.join(" ")).then(async message => {
                await message.suppressEmbeds(true);
            });
        } catch {
            await commandChannel.send(`${moderator} the ${reqType} you tried to invoke was not correctly formatted. Please run the command manually`);
        }
    }

    public static async rejectRequest(message: Message, commandChannel: TextChannel, moderator: GuildMember, reqType: RequestType) {
        try {
            const reqArgs = message.content
                .replace(/(?!_(\w|\d|-)+\.(png|jpe?g|gifv?|webm|wav|mp[34]|ogg|mov|txt)+)[*|~`_>]/gi, "")
                .replace(/\s+/, " ")
                .split(" ");

            let sliceSize = 2;
            if (reqArgs[2].match(/^\d{1,2}[mhd]$/gi) && reqType === RequestType.Mute) sliceSize = 3;

            let targetUserId = reqArgs[1];
            const evidence = reqArgs.slice(sliceSize).join(" ");
            let rejectionNotice = `${message.author} <:reject:${Properties.emojis.reject}> Your ${reqType} request against <@${targetUserId}> (${targetUserId}) has been rejected by ${moderator}${reqType === RequestType.Ban ? " and the user has been unmuted" : ""}.\n\nYour ${reqType} request evidence: ${evidence}`;

            if (reqType === RequestType.Ban) await commandChannel.send(`;unmute ${targetUserId}`);
            await commandChannel.send(rejectionNotice);
        } catch {
            if (reqType === RequestType.Ban) await commandChannel.send(`${moderator} the unmute you tried to invoke was not correctly formatted. Please run the command manually`)
        }
    }

    public static async validateRequest(message: Message, reqType: RequestType) {
        if (
            message.member &&
            !RoleUtils.hasAnyRole(message.member, [RoleUtils.roles.moderator, RoleUtils.roles.trialModerator])
        ) return;

        const re = new RegExp(`^;${reqType}\\s+(?<userId>\\d{17,19})\\s+\\S+`, "gmi");
        const args = re.exec(message.content);

        const deleteMessage = new ButtonBuilder()
            .setCustomId("deleteMessage")
            .setEmoji("🗑️")
            .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder().addComponents(deleteMessage);

        if (!args?.groups) {
            await message.reply({
                content: `Invalid format. Please use the following format: \`;${reqType} <userId>${reqType === RequestType.Mute ? " (duration) " : " "}<reason/proof>\``,
                components: [actionRow as ActionRowBuilder<ButtonBuilder>]
            });
            return;
        }

        const {userId} = args.groups;
        const user = await message.client.users.fetch(userId).catch(async () => {
        });

        if (!user) {
            await message.reply({
                content: "Unable to resolve the user ID, please double check it",
                components: [actionRow as ActionRowBuilder<ButtonBuilder>]
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
                components: [actionRow as ActionRowBuilder<ButtonBuilder>]
            });
            return;
        }
    }
}

export enum RequestType {
    Ban = "ban",
    Mute = "mute"
}
