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

      let selectPath = await knex('protec_path').select('*').where({id: interaction.guild.id})
      let selectPerms = await knex('protec_perms').select('*').where({id: interaction.guild.id})
      let configVip = (selectPerms[0].permission == 'Bronze') ? (selectPath[0].vip === 'Ativado' ? 'Ativado' : 'Desativado') : "Esta função é paga";
      const embedPainel = new EmbedBuilder()
        .setTitle(`Painel de Configuração`)
        .setDescription(
          "Bem vindo ao painel de configuração! Aqui você pode configurar **todas** as funções do bot.\n\n`Use os botões do menu abaixo para cessar as categorias.`"
        )
        .addFields(
          {name:`Ticket`, value: '`' + selectPath[0].ticket + '`', inline: true},
          {name:`Anti Link`, value: '`' + selectPath[0].anti_link + '`', inline: true},
          {name:`Anti Raid`, value: '`' + selectPath[0].anti_raid + '`', inline: true},
          {name:`Logs`, value: '`' + selectPath[0].logs + '`', inline: true},
          {name:`Vip`, value: '`'+configVip+'`', inline: true},
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
