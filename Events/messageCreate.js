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
const { MISMATCH } = require("sqlite3");

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./json.sqlite",
  },
  useNullAsDefault: true,
});
module.exports = async (client, interaction) => {
  client.on("messageCreate", async (msg) => {
    let owner = client.guilds.cache.get(msg.guildId);
    let select = await knex("protec_flood").select("*").where({
      id: msg.author.id,
    }).andWhere({
      id_guild: msg.guildId,
    });

    if(msg.author.id == client.user.id){
      return;
    } else if (select == false) {
      await knex("protec_flood").insert({
        id: msg.author.id,
        message: msg.content,
        qtd: 1,
        punicoes: 0,
        id_guild: msg.guildId,
      });
      setTimeout(async () => {
        await knex("protec_flood")
          .update({
            qtd: 0,
          })
          .where({
            id: msg.author.id,
          }).andWhere({id_guild: msg.guildId,});
        console.log("Flood não começou.");
      }, 1 * 1000 * 25);
    } else if (
      msg.author.id != owner.ownerId &&
      msg.author.id != client.user.id
    ) {
      const qtd = parseInt(select[0].qtd) + 1;
      await knex("protec_flood")
        .update({
          qtd: qtd,
          message: msg.content,
        })
        .where({
          id: msg.author.id,
        }).andWhere({
          id_guild: msg.guildId,
        });

      if (qtd > 7) {
        const guildId = client.guilds.cache.get(msg.guildId);
        const member = guildId.members.cache.get(msg.author.id);
        const channels = guildId.channels.cache.filter((c) => c.isTextBased());

        await knex("protec_flood")
          .update({
            punicoes: parseInt(select[0].punicoes) + 1,
          })
          .where({ id: msg.author.id }).andWhere({
            id_guild: msg.guildId
          });

        for (const channel of channels.values()) {
          try {
            await channel.permissionOverwrites.edit(member.id, {
              SendMessages: false,
            });
            console.log(
              "Permissão de envio de mensagens removida no canal",
              channel.id
            );

            let delay;
            if (parseInt(select[0].punicoes) <= 1) {
              delay = 30 * 1000;
            } else if (parseInt(select[0].punicoes) == 2) {
              delay = 60 * 1000;
            } else if (parseInt(select[0].punicoes) >= 3) {
              member.kick({ reason: `Flood` });
              const guildfor = client.guilds.cache.get("1243216683112464385");
              let channelId = guildfor.channels.cache.get(
                "1285243452618969182"
              );
              const embed = new EmbedBuilder()
                .setTitle("Protec Log")
                .setColor("#FF0000")
                .setDescription("O sistema de flood foi executado!")
                .addFields(
                  {
                    name: "Nome do usuário",
                    value: member.username || "Desconhecido",
                    inline: true,
                  },
                  { name: "Status", value: "**Flood**", inline: true },
                  {
                    name: "Id",
                    value: member.id.toString() || "Desconhecido",
                    inline: true,
                  },
                  { name: "Reason", value: "Flood", inline: true },
                  {
                    name: "Guild",
                    value: `**Dono**: <@${msg.guild.ownerId}> \n **Guild**: ${msg.guild.name}`,
                    inline: true,
                  }
                );

              channelId.send({ embeds: [embed] });
              return;
            }

            setTimeout(async () => {
              try {
                await channel.permissionOverwrites.edit(member.id, {
                  SendMessages: true,
                });
                console.log("Punição Removida no canal", channel.id);
              } catch (err) {
                console.error(
                  `Erro ao restaurar permissões no canal ${channel.id}:`,
                  err
                );
              }
            }, delay);
          } catch (err) {
            console.error(
              `Erro ao atualizar permissões no canal ${channel.id}:`,
              err
            );
          }
        }
      }

      if (qtd == 1) {
        setTimeout(async () => {
          await knex("protec_flood")
            .update({
              qtd: 0,
            })
            .where({
              id: msg.author.id,
            }).andWhere({
              id_guild: msg.guildId,
            });
          console.log("Flood não começou.");
        }, 1 * 1000 * 5);
      }
    }

    // Invites
    const cfg = await knex("protec_config")
      .select("*")
      .where({ id_guild: msg.guildId });

    const urlRegex =
      /(?:https?:\/\/)?(?:www\.)?[^\s]+?\.(?:com|org|net|edu|gov|io|co)(?:[^\s]*)/gi;

    if (cfg.length === 0 || cfg[0].anti_invite == 1) {
      if (urlRegex.test(msg.content) && msg.author.id != owner.ownerId) {
        await msg
          .delete()
          .catch((error) =>
            console.error("Erro ao deletar a mensagem:", error)
          );

        const embed = new EmbedBuilder() // Use MessageEmbed se necessário
          .setDescription(
            `Aqui você não vai divulgar não amigão! <@${msg.author.id}>`
          )
          .setColor(config.color);

        const guildanti = client.guilds.cache.get(msg.guildId);
        if (guildanti) {
          let channelanti = guildanti.channels.cache.get(msg.channelId);
          if (channelanti) {
            channelanti
              .send({ embeds: [embed] })
              .catch((error) => console.error("Erro ao enviar embed:", error));
          } else {
            console.error("Canal não encontrado:", msg.channelId);
          }
        } else {
          console.error("Guilda não encontrada:", msg.guildId);
        }
      }
    }
  });
};
