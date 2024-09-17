const Discord = require("discord.js");
const config = require("../../config.json");
const {
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextInputBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  StringSelectMenuOptionBuilder,
  ModalBuilder,
} = require("discord.js");
const { options } = require("../..");

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./json.sqlite",
  },
  useNullAsDefault: true,
});

module.exports = {
  name: "config",
  description: "Painel de configuração do bot",
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.KickMembers
      )
    ) {
      interaction.reply({ content: "Você não tem permissão", ephemeral: true });
    }
    if (
      interaction.member.permissions.has(
        Discord.PermissionFlagsBits.KickMembers
      )
    ) {
      const embedPainel = new EmbedBuilder()
        .setTitle(`Painel de Configuração`)
        .setDescription(
          "Bem vindo ao painel de configuração! Aqui você pode configurar **todas** as funções do bot.\n\n`Use os botões do menu abaixo para cessar as categorias.`"
        )
        .setColor(config.color);

      const select = new StringSelectMenuBuilder()
        .setCustomId("configprotec")
        .setPlaceholder("Inicie sua configuração!")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Anti-Link")
            .setEmoji("💻")
            .setDescription("Clique aqui para configurar o anti-invite!")
            .setValue("protec_invite"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Anti-Raid")
            .setEmoji("💻")
            .setDescription("Clique aqui para configurar o anti-raid!")
            .setValue("protec_raid"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Logs")
            .setEmoji("📦")
            .setDescription("Clique aqui para configurar o canal de logs!")
            .setValue("protec_log"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Ticket")
            .setEmoji("🛎")
            .setDescription("Clique aqui para configurar o ticket!")
            .setValue("protec_ticket")
        );
      const row = new ActionRowBuilder().addComponents(select);

      interaction.reply({
        embeds: [embedPainel],
        components: [row],
        ephemeral: true,
      });
    }
  },
};
