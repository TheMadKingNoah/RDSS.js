import Properties from "../utils/Properties";
import EmbedBuilds from "../utils/EmbedBuilds";
import EventListener from "../modules/events/Event";
import Bot from "../Bot";

import {StageChannel, TextChannel, VoiceChannel, VoiceState} from "discord.js";

module.exports = class VoiceStateUpdateEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {
            name: "voiceStateUpdate",
            once: false
        });
    }

    async execute(oldState: VoiceState, newState: VoiceState) {
        const voiceLogsChannel = await this.client.channels.fetch(Properties.channels.voiceLogs) as TextChannel;

        const newVoiceChannel = newState.channel as VoiceChannel | StageChannel
        const oldVoiceChannel = oldState.channel as VoiceChannel | StageChannel

        if (!newState.suppress) {
            if (!Properties.membersOnStage.has(newState.member?.id)) {
                Properties.membersOnStage.set(newState.member?.id, new Date())
            }
        } else {
            if (Properties.membersOnStage.has(newState.member?.id)) {
                Properties.membersOnStage.delete(newState.member?.id)
            }
        }

        if (newState.channel?.type != "GUILD_STAGE_VOICE") {
            if (Properties.membersOnStage.has(newState.member?.id)) {
                Properties.membersOnStage.delete(newState.member?.id)
            }
        }

        if (Properties.membersOnStage.size > 0) {
            const modCastText = await this.client.channels.fetch(Properties.channels.modCastText) as TextChannel;
            if (!modCastText) return;

            if (!modCastText.permissionsFor(modCastText.guild.roles.everyone).has(["SEND_MESSAGES"])) {
                modCastText.permissionOverwrites.create(modCastText.guild.roles.everyone, {
                    SEND_MESSAGES: true
                }).catch(console.error);
            }
        } else {
            const modCastText = await this.client.channels.fetch(Properties.channels.modCastText) as TextChannel;
            if (!modCastText) return;

            if (modCastText.permissionsFor(modCastText.guild.roles.everyone).has(["SEND_MESSAGES"])) {
                modCastText.permissionOverwrites.create(modCastText.guild.roles.everyone, {
                    SEND_MESSAGES: false
                }).catch(console.error);
            }
        }

        if (voiceLogsChannel) {
            if (
                (newVoiceChannel && !oldVoiceChannel) ||
                (newVoiceChannel && oldVoiceChannel.type == "GUILD_STAGE_VOICE")
            ) {
                if (!newState.member) return;
                if (newVoiceChannel.type != "GUILD_VOICE") return;

                voiceLogsChannel.send({
                    embeds: [EmbedBuilds.getOnVoiceChannelJoinEmbed(newState)]
                }).catch(console.error);
            }

            if (newVoiceChannel && oldVoiceChannel) {
                if (!newState.member || !oldState.member) return;
                if (newVoiceChannel.type != "GUILD_VOICE" || oldVoiceChannel.type != "GUILD_VOICE") return;
                if (newVoiceChannel.id === oldVoiceChannel.id) return;

                voiceLogsChannel.send({
                    embeds: [EmbedBuilds.getOnVoiceChannelChangeEmbed(oldState, newState)]
                }).catch(console.error);
            }

            if (!newVoiceChannel && oldVoiceChannel) {
                if (!oldState.member) return;
                if (oldVoiceChannel.type != "GUILD_VOICE") return;

                voiceLogsChannel.send({
                    embeds: [EmbedBuilds.getOnVoiceChannelLeaveEmbed(oldState)]
                }).catch(console.error);
            }
        }
    }
}
