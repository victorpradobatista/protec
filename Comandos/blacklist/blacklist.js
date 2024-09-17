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
  name: "bl-protec",
  description: "Ban global de discords.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "Usuario que vai ser banido de todos os servidores.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "Motivo do ban.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    let perms = await knex("protec_perms").select("*").where({
      id: interaction.user.id,
    });

    if (perms == false) {
      const embed = new EmbedBuilder()
        .setDescription(
          "Você não tem permissão do **Protec** para utilizar este comando."
        )
        .setColor(config.color);

      interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (perms[0].permission == "Confident") {
      await knex("protec_blacklist").insert({
        id: user.id,
        name: user.username,
        reason: reason,
      });

      const embed = new EmbedBuilder()
        .setDescription(
          `Usuário banido com sucesso! \n \n **User**: ${user} \n **Motivo**: ${reason}`
        )
        .setColor(config.color);

      client.guilds.cache.forEach(async (guild) => {
        try {
          await guild.members.fetch();
          const member = await guild.members.fetch(user.id);

          if (member) {
            await member.ban({ reason: `${reason} | Blacklist - Protec` });
            console.log(`Banido da guilda: ${guild.name}`);
          } else {
            console.log(`Não encontrado na guilda: ${guild.name}`);
          }
        } catch (error) {
          if (error.code === 10007) {
            console.log(`Usuário não encontrado na guilda: ${guild.name}`);
          } else {
            console.error(
              `Erro ao tentar banir na guilda ${guild.name}:`,
              error
            );
            console.log(`Erro ao banir na guilda: ${guild.name}`);
          }
        }
      });

      interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setDescription(
          "Você não tem permissão do **Protec** para utilizar este comando."
        )
        .setColor(config.color);

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
