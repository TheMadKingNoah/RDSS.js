import { TextChannel, VoiceChannel, VoiceState } from "discord.js";
import Properties from "../utils/Properties";
import EmbedBuilds from "../utils/EmbedBuilds";

module.exports = {
    name: "voiceStateUpdate",
    once: false,
    async execute(oldState: VoiceState, newState: VoiceState) {
        let newVoiceChannel = (newState.channel as VoiceChannel)
        let oldVoiceChannel = (oldState.channel as VoiceChannel)

        const voiceLogsChannel = oldState.client.channels.cache.get(Properties.VOICE_LOGS_CHANNEL_ID);

        if (voiceLogsChannel != null) {

            if (newVoiceChannel !== null && oldVoiceChannel === null) {

                if (newState.member != null) {

                    (voiceLogsChannel as TextChannel).send({ embeds: [EmbedBuilds.getOnVoiceChannelJoinEmbed(newState)] })
                }

            } else if (newVoiceChannel !== null && oldVoiceChannel !== null) {

                if (newState.member != null && newState.member != null) {

                    (voiceLogsChannel as TextChannel).send({ embeds: [EmbedBuilds.getOnVoiceChannelChangeEmbed(oldState, newState)] })

                }

            } else if (newVoiceChannel === null && oldVoiceChannel !== null) {

                if (oldState.member != null) {

                    (voiceLogsChannel as TextChannel).send({ embeds: [EmbedBuilds.getOnVoiceChannelLeaveEmbed(oldState)] })

                }
            }
        }
    }
}
