import { Collection, SelectMenuInteraction } from "discord.js";

import SelectMenu from "./SelectMenu";
import Bot from "../../../Bot";
import path from "path";
import fs from "fs";

export default class SelectMenuHandler {
    client: Bot;
    select_menus: Collection<string, SelectMenu>;

    constructor(client: Bot) {
        this.client = client;
        this.select_menus = new Collection();
    }

    public async load() {
        let commandFiles;

        if (process.env.BOT_TOKEN == "Production") {
              commandFiles = fs.readdirSync(path.join(__dirname, "../../../interactions/select_menus"))
                    .filter(file => file.endsWith(".js"));
        } else {
              commandFiles = fs.readdirSync(path.join(__dirname, "../../../interactions/select_menus"))
                    .filter(file => file.endsWith(".ts"));
        }

        for (const file of commandFiles) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const select_menu = require(path.join(__dirname, "../../../interactions/select_menus", file)).default;
            new select_menu(this.client);
        }
    }

    public async register(select_menu: SelectMenu) {
        this.select_menus.set(select_menu.name, select_menu);
        console.log(`(SELECT MENUS) Registered select menu: "${select_menu.name}"`);
    }

    public async handle(interaction: SelectMenuInteraction) {
        const select_menu = this.select_menus.get(interaction.customId);

        if (!select_menu) {
            return;
        }

        // @ts-ignore
        select_menu.execute(interaction, this.client)
            .then(() => console.log(`(SELECT MENUS) "${select_menu.name}" executed by ${interaction.user.tag}`))
            .catch((err: any) => {
                console.log(`Failed to execute select menu: ${select_menu.name}`);
                console.error(err);
            });
    }
}