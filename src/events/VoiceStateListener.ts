import { VoiceChannel, VoiceState } from "discord.js";

module.exports = {
    name: "voiceStateUpdate",
    once: false,
    async execute(oldState: VoiceState, newState: VoiceState) {
        let newUserChannel = (newState.channel as VoiceChannel)
        let oldUserChannel = (oldState.channel as VoiceChannel)

        if (newUserChannel !== null && oldUserChannel === null) {

            // User Joins a voice channel
            console.log("member joined!");

        } else if (newUserChannel !== null && oldUserChannel !== null) {

            // User switches from voice channel
            console.log("member switched!");
        } else if (newUserChannel === null && oldUserChannel !== null) {

            // User leaves a voice channel
            console.log("member left!");
        }
    }
}
