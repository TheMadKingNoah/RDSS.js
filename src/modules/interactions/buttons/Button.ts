import Bot from "../../../Bot";

export default class Button {
      client: Bot;
      name: string | { startsWith: string } | { endsWith: string } | { includes: string };

      constructor(client: Bot, data: { name: string | { startsWith: string; } | { endsWith: string; } | { includes: string; } }) {
            this.client = client;
            this.name = data.name;

            this.client.buttons.register(this).catch(console.error);
      }
}