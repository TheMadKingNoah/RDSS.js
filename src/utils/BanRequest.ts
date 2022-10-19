import Properties from "./Properties";

import {
    GuildMember,
    TextChannel,
    Message
} from "discord.js";

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
                commandChannel.send(`;ban ${userToBan} ${evidence}`).then( message => { message.suppressEmbeds(true)});
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
}

