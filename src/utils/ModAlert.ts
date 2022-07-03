import { Message, MessageActionRow, MessageButton, TextChannel } from "discord.js";
import Properties from "./Properties";

export default class ModAlert {

    public static existingModAlerts = new Map();

    public static createModAlert(message: Message, user: { id: any; }) {
        if (message.content.length > 200) {
            message.content = message.content.substring(0, 201) + "...";
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

        if ((message.content.match(/\n/g) || '').length > 10) {
            potentialWallPost = "\n:warning: **Warning:** Potential wall-post! :warning: (`" + (message.content.match(/\n/g) || '').length + " lines detected!`)"
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('OK')
                    .setLabel('OK')
                    .setStyle('SUCCESS'),
            );

        if (message.content.length > 0) {
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

            const content = message.content.replace(/\r?\n|\r/g, " ");
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
            const newAlert = (channel as TextChannel).send({
                content:
                    `\n**Reported by:** <@${user.id}> (ID: \`${user.id}\`)`
                    + `\n**Against:** <@${message.author.id}> (ID: \`${message.author.id}\`)`
                    + `\n ${message.url}/`
                    + hasContent
                    + potentialWallPost
                    + hasFile
                    + `\n(Access the jump URL to take action. Once finished, react to this message with one of the buttons)`
                , components: [row]
            });
            ModAlert.existingModAlerts.set(message.id, message.id);
        }

    }
}