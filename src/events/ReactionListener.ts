import { BaseGuildTextChannel, Client, ClientOptions, Message, MessageActionRow, MessageAttachment, MessageButton, TextChannel } from "discord.js";
import ModAlert from "../utils/ModAlert";
import Properties from "../utils/Properties";

const existingModAlerts = new Map();

module.exports = {
    name: "messageReactionAdd",
    once: false,
    async execute(reaction: { emoji: { id: string; }; message: { fetch: () => Promise<any>; }; client: { channels: { cache: { get: (arg0: string) => any; }; }; }; }, user: { id: any; }){
        if(reaction.emoji.id == "864251741711892501") {
            reaction.message.fetch().then( message => {
                if(!existingModAlerts.has(message.id)) {
                    ModAlert.createModAlert(message, user);
                }
            })
        }
    }
}
