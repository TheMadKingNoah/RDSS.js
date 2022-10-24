import Properties from "./Properties";

import {
    GuildMember,
    TextChannel,
    Message
} from "discord.js";

export default class MuteRequest {
    public static approveMuteRequest(message: Message, commandChannel: TextChannel, moderator: GuildMember) {
        try {
            let muteRequestContent: string[] = message.content
                .replaceAll("(?i)(?!_(\\w|\\d|-)+\\.(png|jpe?g|gifv?|webm|wav|mp[34]|ogg|mov|txt)+)[\\*\\|\\~\\`\\_\\>]", "")
                .replaceAll("\\s+", " ")
                .split(" ");

            let actionAuthor = `(approved by ${moderator.user.tag} (${moderator.id})) `;

            for (let i = 2; i < muteRequestContent.length; i++) {
                actionAuthor += muteRequestContent[i] + " ";
            }

            let evidence = actionAuthor.replaceAll('|', '').toString();
            const userToMute = muteRequestContent[1];
            const duration = muteRequestContent[2];

            if(duration.length < 4){
                evidence = evidence.replace(duration, "")

                if (
                    muteRequestContent[0].toLowerCase() === ";mute" ||
                    muteRequestContent[0].toLowerCase() === ";forcemute"
                ) {
                    commandChannel.send(`;mute ${userToMute} ${duration} ${evidence}`);
                } else {
                    commandChannel.send(`${moderator} the mute you tried to invoke was not correctly formatted. Please run the command manually`);
                }
            } else {
                if (
                    muteRequestContent[0].toLowerCase() === ";mute" ||
                    muteRequestContent[0].toLowerCase() === ";forcemute"
                ) {
                    commandChannel.send(`;mute ${userToMute} ${evidence}`);
                } else {
                    commandChannel.send(`${moderator} the mute you tried to invoke was not correctly formatted. Please run the command manually`);
                }
            }
        } catch {
            commandChannel.send(`${moderator} the mute you tried to invoke was not correctly formatted. Please run the command manually`)
        }
    }
}

