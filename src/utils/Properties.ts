export default class Properties {
    public static emojis = {
        alert: "1030962434237812737",
        approve: "998006595332096030",
        reject: "998006596376477777",
        quickMute30: "1030962435944886373",
        quickMute60: "1030962437408702484",
        sweep: "998006599710949416"
    }

    public static channels = {
        alerts: "998003633205563552",
        commands: "998003692215214172",
        moderators: "1048351386817003580",
        seniorModerators: "1053286875999240192",
        banRequestsQueue: "998003733914976388",
        messageLogs: "998003762805346374",
        mediaLogs: "1048347572131090602",
        voiceLogs: "998003789074284574",
        modCastText: "998003814042972311",
        winnerQueue: "1028368336448401419",
        trialModerators: "1048351418098139196",
        muteRequestQueue: "1091029188766605324",
        trialLogs: "1091029249730814012",
        creations: "1091029296820260886",
        avatars: "1091029332291489912"
    }

    public static categories = {
        internalChannels: "998003620081586297"
    }

    public static modAlertCooldown: number = 5;
    public static membersOnStage = new Map();
    public static guildId = "997590641825546410";
}
