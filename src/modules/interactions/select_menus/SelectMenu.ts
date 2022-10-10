import Bot from "../../../Bot";

export default class SelectMenu {
    client: Bot;
    name: string;

    constructor(client: Bot, data: { name: string }) {
        this.client = client;
        this.name = data.name;

        this.client.select_menus.register(this).catch(console.error);
    }
}