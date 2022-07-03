import { BaseGuildTextChannel, Client, ClientOptions, Message, MessageActionRow, MessageAttachment, MessageButton, TextChannel } from "discord.js";
import ModAlert from "../utils/ModAlert";
import Properties from "../utils/Properties";

module.exports = {
    name: "messageReactionAdd",
    once: false,
    async execute(reaction: { emoji: { id: string; }; message: { fetch: () => Promise<any>; }; client: { channels: { cache: { get: (arg0: string) => any; }; }; }; }, user: { id: any; }) {
        if (reaction.emoji.id == Properties.ALERT_EMOJI_ID) {
            reaction.message.fetch().then(message => {
                if (message.channel.id != Properties.ALERT_CHANNEL_ID) {
                    if (!ModAlert.existingModAlerts.has(message.id)) {
                        ModAlert.createModAlert(message, user);
                    }
                }
            })
        }
    }
}
