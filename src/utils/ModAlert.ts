import Properties from "./Properties";
import RoleUtils from "./RoleUtils";

import {
    MessageActionRow,
    MessageButton,
    TextChannel,
    Message,
    User,
    GuildMember
} from "discord.js";

export default class ModAlert {
    public static existingModAlerts = new Map();
    public static lastModAlert = new Date();

    public static createModAlert(message: Message, user: User) {
        const timeSinceLastAlert = (new Date().getTime() - this.lastModAlert.getTime()) / 1000;
        if (timeSinceLastAlert < Properties.modAlertCooldown) return;

        const modAlertChannel = message.client.channels.cache.get(Properties.channels.alerts) as TextChannel;
        if (!modAlertChannel) return;

        this.lastModAlert = new Date();

        let messageContent = message.content
        if (message.content.length > 200) {
            messageContent = message.content.substring(0, 200) + "...";
        }

        let contentPreview = "";
        let hasAttachments = "";
        let potentialWallPost = "";
        let contentTypes: string[] = [];

        if (message.attachments.size > 0) {
            message.attachments.forEach((element: any) => {
                if (!contentTypes.includes(element.contentType)) {
                    contentTypes.push(element.contentType)
                }
            });

            hasAttachments = "\n:warning: **Warning:** This message contains attachments! :warning: (`" + contentTypes + "`)"
        }

        if ((messageContent.match(/\n/g) || '').length > 10) {
            potentialWallPost = "\n:warning: **Warning:** Potential wall-post! :warning: (`" + (messageContent.match(/\n/g) || '').length + " lines detected!`)"
        }

        const actionRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('ClearModAlert')
                    .setLabel('OK')
                    .setStyle('SUCCESS'),
            );

        if (messageContent.length > 0) {
            actionRow.addComponents(
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
            contentPreview = `\n**Preview**:` + `\n> ${content}`;
        }

        actionRow.addComponents(
            new MessageButton()
                .setCustomId("Infractions")
                .setLabel("Infractions")
                .setStyle("SECONDARY"),
        );

        modAlertChannel.send({
            content:
                `<:alert:${Properties.emojis.alert}> <@&${RoleUtils.roles.moderator}> <@&${RoleUtils.roles.trialModerator}>`
                + `\n**Reported by:** <@${user.id}> (ID:\` ${user.id} \`)`
                + `\n**Against:** <@${message.author.id}> (ID:\` ${message.author.id} \`)`
                + `\n <${message.url}>/`
                + contentPreview
                + potentialWallPost
                + hasAttachments
                + `\n(Access the jump URL to take action. Once finished, react to this message with one of the buttons)`,
            components: [actionRow]
        }).then(alertMessage => {
            console.log(`New mod alert: ${message.id}`);
            this.existingModAlerts.set(message.id, message.content);
            console.log(this.existingModAlerts);
        }).catch(console.error)
    }

    public static updateModAlert(message: Message, member: GuildMember, modAlertChannel: TextChannel) {
        modAlertChannel.messages.fetch({
            limit: 100,
        }).then((messages) => {
            messages.forEach(element => {
                const fetchedMessageId: string = element.content.split("/")[6].replace(/\D/g, '');
                if(fetchedMessageId == message.id){
                    const actionRow = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('ClearModAlert')
                            .setLabel('OK')
                            .setStyle('SUCCESS'),
                    );
                    actionRow.addComponents(
                        new MessageButton()
                            .setCustomId("Infractions")
                            .setLabel("Infractions")
                            .setStyle("SECONDARY"),
                    );

                    element.edit({content: element.content + `\n\n **This mod alert is being handled by <@${member.id}>.**`, components: [actionRow]})
                }
            });
        }).then(e => {})
    }

    public static deleteModAlert(messageId: string, modAlertMessage: Message | null, modAlertChannel: TextChannel | null) {
        if (this.existingModAlerts.has(messageId)) this.existingModAlerts.delete(messageId);

        console.log(`A mod alert is about to be removed: ${messageId}`);
        console.log(this.existingModAlerts);

        if (!modAlertMessage && modAlertChannel) {
            modAlertChannel.messages.fetch({
                limit: 100
            }).then(messages => {
                messages.forEach(message => {
                    const fetchedMessageId: string = message.content.split("/")[6].replace(/\D/g, '');
                    if (fetchedMessageId == messageId) message.delete().catch(console.error);
                });
            }).then(console.error);

            return;
        }

        if (modAlertMessage) modAlertMessage.delete().catch(console.error);
    }
}

