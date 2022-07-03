import { Collection } from "discord.js";

export default class Properties {   
    public static ALERT_EMOJI_ID: string = "993282855595679854";

    public static ALERT_CHANNEL_ID: string = "864250737689362433";

    public static COMMANDS_CHANNEL_ID: string = "864250679485136907";

    public static ALERT_MODS_COOLDOWN: number = 5;

    public static COMMANDS: Collection<unknown, unknown>;
}