import { MessageEmbed, VoiceState } from "discord.js";

export default class EmbedBuilds {
    public static getOnVoiceChannelJoinEmbed(newState: VoiceState): MessageEmbed {
        const embed = new MessageEmbed()
        .setColor("#2ecc71")
        .setTitle("test")
        //todo: Create an Embed for when a user joins a voice channel

        return embed;
    }

    public static getOnVoiceChannelChangeEmbed(oldState: VoiceState, newState: VoiceState): MessageEmbed {
        const embed = new MessageEmbed()
        //todo: Create an Embed for when a user changes voice channel
        return embed;
    }

    public static getOnVoiceChannelLeaveEmbed(oldState: VoiceState): MessageEmbed {
        const embed = new MessageEmbed()
        //todo: Create an Embed for when a user leaves a voice channel
        return embed;
    }
 }