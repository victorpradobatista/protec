const Discord = require("discord.js");
const config = require("../config.json");
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const messageCreate = require("./messageCreate");

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./json.sqlite",
  },
  useNullAsDefault: true,
});

module.exports = async (client, interaction) => {
  client.on("guildMemberAdd", async (member) => {
    let anti_raid = await knex("protec_contagems")
      .select("*")
      .where({ id_guild: member.guild.id });
    let cfg = await knex("protec_config")
      .select("*")
      .where({ id_guild: member.guild.id });
    let select = await knex("protec_blacklist")
      .select("*")
      .where({ id: member.id });
    let guildId = client.guilds.cache.get("1243216683112464385");
    let channelId = guildId.channels.cache.get("1285243452618969182");

    if (select == false) {
      const embed = new EmbedBuilder()
        .setTitle("Protec Log")
        .addFields(
          {
            name: "Nome do usuário",
            value: member.username ? member.username : "Desconhecido", // Verificação e fallback
            inline: true,
          },
          {
            name: "Status",
            value: "Não está na blacklist",
            inline: true,
          },
          {
            name: "Id",
            value: member.id ? member.id.toString() : "Desconhecido", // Verificação e fallback
            inline: true,
          },
          {
            name: "Guild",
            value: `**Dono**: <@${member.guild.ownerId}> \n **Guild**: ${member.guild.name}`,
            inline: true,
          }
        )
        .setColor(config.color)
        .setDescription("O sistema de blacklist foi verificado!");

      channelId.send({ embeds: [embed] });
    } else {
      member.ban({ reason: "Blacklist - Protec" });

      const embed = new EmbedBuilder()
        .setTitle("Protec Log")
        .setColor("#FF0000")
        .setDescription("O sistema de blacklist foi verificado!")
        .addFields(
          {
            name: "Nome do usuário",
            value: member.username ? member.username : "Desconhecido",
            inline: true,
          },
          {
            name: "Status",
            value: "**Blacklisted**",
            inline: true,
          },
          {
            name: "Id",
            value: member.id ? member.id.toString() : "Desconhecido",
            inline: true,
          },
          {
            name: "Reason",
            value: select[0].reason,
            inline: true,
          },
          {
            name: "Guild",
            value: `**Dono**: <@${member.guild.ownerId}> \n **Guild**: ${member.guild.name}`,
            inline: true,
          }
        );

      channelId.send({ embeds: [embed] });
    }

    if (anti_raid == false) {
      await knex("protec_contagems").insert({
        id_guild: member.guild.id,
        anti_raid: 1,
      });

      setTimeout(async () => {
        await knex("protec_contagems")
          .update({
            anti_raid: 0,
          })
          .where({
            id_guild: member.guild.id,
          });
      }, 1 * 1000 * 30);
    } else {
      let contagem = anti_raid[0].anti_raid + 1;

      await knex("protec_contagems")
        .update({
          anti_raid: contagem,
        })
        .where({
          id_guild: member.guild.id,
        });

      if (anti_raid[0].anti_raid >= cfg[0].max_members) {
        member.ban({ reason: "Anti-Raid" });

        if (cfg[0].logs != null) {
          const channelLog = member.guild.channels.cache.get(cfg[0].logs);

          const embedRaid = new EmbedBuilder()
            .setTitle("Protec Log")
            .setColor("#FF0000")
            .setDescription("O sistema de anti-raid foi executado!")
            .addFields(
              {
                name: "Nome do usuário",
                value: member.username || "Desconhecido",
                inline: true,
              },
              { name: "Punição", value: `Banimento`, inline: true },
              {
                name: "Entradas executadas por minuto",
                value: `${anti_raid[0].anti_raid}`,
                inline: true,
              }
            );

          channelLog.send({ embeds: [embedRaid] });
          channelId.send({ embeds: [embedRaid] });
        } else {
        }
      }

      setTimeout(async () => {
        await knex("protec_contagems")
          .update({
            anti_raid: 0,
          })
          .where({
            id_guild: member.guild.id,
          });
      }, 1 * 1000 * 30);
    }
  });
};
