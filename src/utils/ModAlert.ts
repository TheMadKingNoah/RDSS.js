import { Channel, GuildMember, Message, MessageActionRow, MessageButton, TextChannel, User } from "discord.js";
import Properties from "./Properties";
import QuickMute from "./QuickMute";
import RoleUtils from "./RoleUtils";

export default class ModAlert {

    public static existingModAlerts = new Map();
    public static lastModAlert = new Date();

    public static createModAlert(message: Message, user: User) {
        if (((new Date().getTime() - this.lastModAlert.getTime()) / 1000) > Properties.ALERT_MODS_COOLDOWN) {
            this.lastModAlert = new Date();

            let messageContent = message.content
            if (message.content.length > 200) {
                messageContent = message.content.substring(0, 201) + "...";
            }

            let hasContent = "";
            let hasFile: string = "";
            let potentialWallPost = "";
            let contentTypes: Array<string> = [];

            if (message.attachments.size > 0) {
                message.attachments.forEach((element: any) => {
                    if (!contentTypes.includes(element.contentType)) {
                        contentTypes.push(element.contentType)
                    }
                });

                hasFile = "\n:warning: **Warning:** This message contains attachments! :warning: (`" + contentTypes + "`)"
            }

            if ((messageContent.match(/\n/g) || '').length > 10) {
                potentialWallPost = "\n:warning: **Warning:** Potential wall-post! :warning: (`" + (messageContent.match(/\n/g) || '').length + " lines detected!`)"
            }

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('ApproveModAlert')
                        .setLabel('OK')
                        .setStyle('SUCCESS'),
                );

            if (messageContent.length > 0) {
                row.addComponents(
                    new MessageButton()
                        .setCustomId("qm30")
                        .setLabel("30m")
                        .setStyle("PRIMARY"),

                    new MessageButton()
                        .setCustomId("qm60")
                        .setLabel("60m")
                        .setStyle("DANGER"),
                )

                const content = messageContent.replace(/\r?\n|\r/g, " ");
                hasContent = `\n**Preview**:` + `\n> ${content}`;
            }

            row.addComponents(
                new MessageButton()
                    .setCustomId("Infractions")
                    .setLabel("Infractions")
                    .setStyle("SECONDARY"),
            );

            const channel = message.client.channels.cache.get(Properties.ALERT_CHANNEL_ID);

            if (channel != null) {
                const alertEmoji = channel.client.emojis.cache.get(Properties.ALERT_EMOJI_ID);
                (channel as TextChannel).send({
                    content:
                        `${alertEmoji} <@&${RoleUtils.ROLE_MODERATOR_ID}> <@&${RoleUtils.ROLE_TRIAL_MODERATOR_ID}>`
                        + `\n**Reported by:** <@${user.id}> (ID:\` ${user.id} \`)`
                        + `\n**Against:** <@${message.author.id}> (ID:\` ${message.author.id} \`)`
                        + `\n <${message.url}>/`
                        + hasContent
                        + potentialWallPost
                        + hasFile
                        + `\n(Access the jump URL to take action. Once finished, react to this message with one of the buttons)`
                    , components: [row]
                }).then( alertMessage => {
                    console.log(`new mod alert! ${message.id}`)
                    this.existingModAlerts.set(message.id, message.content);
                    console.log(this.existingModAlerts);
                }).catch(err => console.error(err))
            }
        }
    }

    public static updateModAlert(message: Message, member: GuildMember, modAlertChannel: TextChannel) {
        modAlertChannel.messages.fetch({
            limit: 100,
        }).then((messages) => {
            messages.forEach(element => {
                const fetchedMessageId: string = element.content.split("/")[6].replace(/\D/g, '');
                if(fetchedMessageId == message.id){
                    element.edit(`a mod alert is handled by <@${member.id}>`);
                }
            });
        }).then(e => {})
    }

    public static deleteModAlert(messageId: string, modAlertMessage: Message | null, modAlertChannel: TextChannel | null) {
        if (this.existingModAlerts.has(messageId)) {
            this.existingModAlerts.delete(messageId);
        }

        console.log(`a mod alert is about to be removed! ${messageId}`)
        console.log(this.existingModAlerts)

        if (modAlertMessage == null && modAlertChannel != null) {
            modAlertChannel.messages.fetch({
                limit: 100,
            }).then((messages) => {
                messages.forEach(element => {
                    const fetchedMessageId: string = element.content.split("/")[6].replace(/\D/g, '');
                    if(fetchedMessageId == messageId){
                        element.delete().catch(err => console.error(err));
                    }
                });
            }).then(e => {})
        } else if(modAlertMessage != null){
            modAlertMessage.delete().catch(err => console.error(err));
        }
    }

    public static approveBanRequest(message: Message, commandChannel: TextChannel, moderator: GuildMember) {
        try {

            let banRequestMessageContent: string[] = message.content.replaceAll("(?i)(?!_(\\w|\\d|-)+\\.(png|jpe?g|gifv?|webm|wav|mp[34]|ogg|mov|txt)+)[\\*\\|\\~\\`\\_\\>]", "").replaceAll("\\s+", " ").split(" ");

            let banRequestString = `(approved by ${moderator.user.tag} (${moderator.id})) `;

            for (let i = 2; i < banRequestMessageContent.length; i++) {
                banRequestString += banRequestMessageContent[i] + " ";
            }

            const evidence = banRequestString.replaceAll('|', '').toString();
            const userToBan: string = banRequestMessageContent[1];

            if (banRequestMessageContent[0].toLowerCase() === ";ban"
                || banRequestMessageContent[0].toLowerCase() === ";forceban") {

                commandChannel.send(`;ban ${userToBan} ${evidence}`)

            } else {
                commandChannel.send(`${moderator.id} the ban you tried to invoke was not correctly formatted. Please run the command manually`)
            }
        } catch (e) {
            commandChannel.send(`${moderator.id} the ban you tried to invoke was not correctly formatted. Please run the command manually`)
        }
    }

    public static rejectBanRequest(message: Message, commandChannel: TextChannel, moderator: GuildMember) {
        try {

            let banRequestMessageContent: string[] = message.content.replaceAll("(?i)(?!_(\\w|\\d|-)+\\.(png|jpe?g|gifv?|webm|wav|mp[34]|ogg|mov|txt)+)[\\*\\|\\~\\`\\_\\>]", "").replaceAll("\\s+", " ").split(" ");
            let reportedUserId: string = banRequestMessageContent[1];

            const denyEmoji = commandChannel.client.emojis.cache.get(Properties.REJECT_EMOJI_ID);

            let rejectionNoticeString = `<@${message.author.id}> ${denyEmoji} your ban request against <@${reportedUserId}> (${reportedUserId}) has been rejected by <@${moderator.id}> and the user has been unmuted. \n\n Your ban request evidence: `;

            for (let i = 2; i < banRequestMessageContent.length; i++) {
                rejectionNoticeString += banRequestMessageContent[i] + " ";
            }

            commandChannel.send(`;unmute ${reportedUserId}`);
            commandChannel.send(rejectionNoticeString);

        } catch (e) {
            commandChannel.send(`${moderator.id} the ban you tried to invoke was not correctly formatted. Please run the command manually`)
        }
    }
}

