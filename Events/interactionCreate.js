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
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./json.sqlite",
  },
  useNullAsDefault: true,
});

module.exports = async (client, interaction) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.customId == "buttonBuy") {
      const [selectSkin, selectMoney] = await Promise.all([
        knex("skins_jaya")
          .select("*")
          .where({ name: interaction.message.embeds[0].data.title }),
        knex("users_economy_jaya")
          .select("*")
          .where({ id: interaction.user.id }),
      ]);
    }

    if (interaction.values == "protec_invite") {
      const modal = new ModalBuilder()
        .setCustomId("protecModal_invite")
        .setTitle("Responda com Sim ou Não! (Anti-Invite)");
      const AntiInvite = new TextInputBuilder()
        .setCustomId("antiinvite")
        .setLabel("Sim para ter a proteção, Não para recusar")
        .setStyle(TextInputStyle.Short);

      const ActionRow = new ActionRowBuilder().addComponents(AntiInvite);

      modal.addComponents(ActionRow);
      await interaction.showModal(modal);
    }
    if (interaction.values == "protec_log") {
      const modal = new ModalBuilder()
        .setCustomId("protecModal_log")
        .setTitle("A um passo da segurança!");
      const logChannel = new TextInputBuilder()
        .setCustomId("logChannel")
        .setLabel("Coloque o id do canal de logs")
        .setStyle(TextInputStyle.Short);

      const ActionRow = new ActionRowBuilder().addComponents(logChannel);

      modal.addComponents(ActionRow);
      await interaction.showModal(modal);
    }
    if (interaction.values == "protec_ticket") {
      let select = await knex("protec_config").select("*").where({
        id_guild: interaction.guild.id,
      });

      if(select == false) {
        await knex('protec_config').insert({
          id_guild: interaction.guild.id,
          anti_invite: 1,
          invite_channels: 'none',
          max_members: 10,
          logs: null,
          ticket: null,
          ticket_category: null,
          ticket_desc: 'Ticket'
        })
      }

      const modal = new ModalBuilder()
        .setCustomId("protecModal_ticket")
        .setTitle("Configure seu ticket!");
      const ticketTitle = new TextInputBuilder()
        .setCustomId("ticketTitle")
        .setLabel("Coloque o titulo do seu painel!")
        .setStyle(TextInputStyle.Short);
      const ticketChannel = new TextInputBuilder()
        .setCustomId("ticketChannel")
        .setLabel("Coloque o id do canal onde irá o painel!")
        .setStyle(TextInputStyle.Short);
      const ticketCategory = new TextInputBuilder()
        .setCustomId("ticketCategory")
        .setLabel("Coloque o id da categoria dos tickets!")
        .setStyle(TextInputStyle.Short);
      const ticketDesc = new TextInputBuilder()
        .setCustomId("ticketDesc")
        .setLabel("Coloque a descrição do seu painel!")
        .setStyle(TextInputStyle.Paragraph);
      const ticketColor = new TextInputBuilder()
        .setCustomId("ticketColor")
        .setLabel("Escolha a cor do seu ticket ex: #000")
        .setStyle(TextInputStyle.Short);
      const ticketStaff = new TextInputBuilder()
        .setCustomId("ticketStaff")
        .setLabel("Coloque o id do cargo staff que vera os tickets")
        .setStyle(TextInputStyle.Short);

      const ActionRow = new ActionRowBuilder().addComponents(ticketChannel)
      const ActionRow2 = new ActionRowBuilder().addComponents(ticketCategory)
      const ActionRow3 = new ActionRowBuilder().addComponents(ticketDesc)
      const ActionRow4 = new ActionRowBuilder().addComponents(ticketColor)
      const ActionRow5 = new ActionRowBuilder().addComponents(ticketTitle)
      const ActionRow6 = new ActionRowBuilder().addComponents(ticketStaff)

      modal.addComponents(ActionRow, ActionRow2, ActionRow3, ActionRow4, ActionRow5, ActionRow6);
      await interaction.showModal(modal);
    }
    if (interaction.values == "protec_raid") {
      const modal = new ModalBuilder()
        .setCustomId("protecModal_raid")
        .setTitle("Escolha um numero maximo de entradas!");
      const AntiRaid = new TextInputBuilder()
        .setCustomId("antiraid")
        .setLabel("Numero maximo de entradas por minuto")
        .setStyle(TextInputStyle.Short);

      const ActionRow = new ActionRowBuilder().addComponents(AntiRaid);

      modal.addComponents(ActionRow);
      await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'protecModal_ticket') {
        const ticket = interaction.fields.getTextInputValue("ticketChannel");
        const ticketCategory = interaction.fields.getTextInputValue("ticketCategory");
        const ticketDesc = interaction.fields.getTextInputValue("ticketDesc");
        const ticketTitle = interaction.fields.getTextInputValue("ticketTitle");
        const ticketColor = interaction.fields.getTextInputValue("ticketColor");
        const ticketStaff = interaction.fields.getTextInputValue("ticketStaff");
        let selectKnex = await knex('protec_config').select('*').where({id_guild: interaction.guild.id})
        await knex('protec_config').update({
          ticket: ticket,
          ticket_category: ticketCategory,
          ticket_desc: ticketDesc,
          ticket_color: ticketColor,
          ticket_title: ticketTitle,
          ticket_staff: ticketStaff,
        }).where({id_guild: interaction.guild.id})

        const embed = new EmbedBuilder()
          .setDescription('Painel configurado com sucesso!')
          .setColor(config.color)
        
        const painel = new EmbedBuilder()
          .setTitle(ticketTitle)
          .setDescription(selectKnex[0].ticket_desc)
          .setColor(ticketColor)

          const select = new StringSelectMenuBuilder()
          .setCustomId("protec_painel")
          .setPlaceholder("Selecione uma das opções!")
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Duvidas")
              .setEmoji("🛎")
              .setDescription("Clique aqui para retirar suas duvidas")
              .setValue("protec_duvidas"),
            new StringSelectMenuOptionBuilder()
              .setLabel("Denuncias")
              .setEmoji("❌")
              .setDescription("Clique aqui para denunciar um outlaw!")
              .setValue("protec_denuncias"),
            new StringSelectMenuOptionBuilder()
              .setLabel("Outro")
              .setEmoji("👥")
              .setDescription("Clique aqui caso não seja nenhuma das anteriores!")
              .setValue("protec_outro")
          );
          const row = new ActionRowBuilder().addComponents(select);
        
        const panelChannel = interaction.guild.channels.cache.get(ticket)
        panelChannel.send({embeds: [painel], components: [row]})
        interaction.reply({embeds: [embed], ephemeral: true})
      }
      if (interaction.customId === "protecModal_log") {
        const channelId = interaction.fields.getTextInputValue("logChannel");
        let select = await knex("protec_config")
          .select("*")
          .where({ id_guild: interaction.guild.id });

        if (select == false) {
          await knex('protec_config').insert({
            id_guild: interaction.guild.id,
            anti_invite: 1,
            invite_channels: 'none',
            max_members: 10,
            logs: channelId,
            ticket: null,
            ticket_category: null,
            ticket_desc: 'Ticket'
          })

          const embedLogs = new EmbedBuilder()
          .setDescription(
            `Canal de logs setado com sucesso! \n \n **Canal**: <#${channelId}>`
          )
          .setColor(config.color);

        interaction.reply({ embeds: [embedLogs], ephemeral: true });
        } else {
          await knex("protec_config")
            .update({
              logs: channelId,
            })
            .where({ id_guild: interaction.guild.id });

          const embedLogs = new EmbedBuilder()
            .setDescription(
              `Canal de logs setado com sucesso! \n \n **Canal**: <#${channelId}>`
            )
            .setColor(config.color);

          interaction.reply({ embeds: [embedLogs], ephemeral: true });
        }
      }
      if (interaction.customId === "protecModal_raid") {
        const raidqtd = parseInt(
          interaction.fields.getTextInputValue("antiraid")
        );
        let select = await knex("protec_config")
          .select("*")
          .where({ id_guild: interaction.guild.id });

        if (select == false) {
          await knex('protec_config').insert({
            id_guild: interaction.guild.id,
            anti_invite: 1,
            invite_channels: 'none',
            max_members: raidqtd,
            logs: null,
            ticket: null,
            ticket_category: null,
            ticket_desc: 'Ticket'
          })

          const embed = new EmbedBuilder()
            .setDescription(
              "Anti-Raid ativado com sucesso! \n \n**Numero maximo de membros definido por minuto para**: " +
                raidqtd +
                ""
            )
            .setColor(config.color);
          interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          await knex("protec_config")
            .update({
              max_members: raidqtd,
            })
            .where({ id_guild: interaction.guild.id });

          const embed = new EmbedBuilder()
            .setDescription(
              "Anti-Raid ativado com sucesso! \n \n**Numero maximo de membros definido por minuto para**: " +
                raidqtd +
                ""
            )
            .setColor(config.color);
          interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
      if (interaction.customId === "protecModal_invite") {
        const trueorfalse = interaction.fields
          .getTextInputValue("antiinvite")
          .trim()
          .toLowerCase();
        let select = await knex("protec_config")
          .select("*")
          .where({ id_guild: interaction.guild.id });
        const validResponses = ["sim", "não", "nao"];

        if (select == false) {
          if (!validResponses.includes(trueorfalse)) {
            const embed = new EmbedBuilder()
              .setDescription(
                "**Configuração feita de forma incorreta!** \n Resposta que escreveu: ```" +
                  trueorfalse +
                  "``` \n \n Responda com Sim ou Não!"
              )
              .setColor(config.color);
            return interaction.reply({ embeds: [embed], ephemeral: true });
          }

          if (trueorfalse === "sim") {
            await knex('protec_config').insert({
              id_guild: interaction.guild.id,
              anti_invite: 1,
              invite_channels: 'none',
              max_members: 10,
              logs: null,
              ticket: null,
              ticket_category: null,
              ticket_desc: 'Ticket'
            })

            const embedT = new EmbedBuilder()
              .setDescription(
                "Configuração feita! Você optou por utilizar a segurança de convites!"
              )
              .setColor(config.color);

            return interaction.reply({ embeds: [embedT], ephemeral: true });
          }

          if (trueorfalse === "não" || trueorfalse === "nao") {
            await knex('protec_config').insert({
              id_guild: interaction.guild.id,
              anti_invite: 0,
              invite_channels: 'none',
              max_members: 10,
              logs: null,
              ticket: null,
              ticket_category: null,
              ticket_desc: 'Ticket'
            })

            const embed404 = new EmbedBuilder()
              .setDescription(
                "Configuração feita! Você selecionou para não usar a segurança de convites!"
              )
              .setColor(config.color);

            return interaction.reply({ embeds: [embed404], ephemeral: true });
          }
        } else {
          if (!validResponses.includes(trueorfalse)) {
            const embed = new EmbedBuilder()
              .setDescription(
                "**Configuração feita de forma incorreta!** \n Resposta que escreveu: ```" +
                  trueorfalse +
                  "``` \n \n Responda com Sim ou Não!"
              )
              .setColor(config.color);
            return interaction.reply({ embeds: [embed], ephemeral: true });
          }

          if (trueorfalse === "sim") {
            await knex("protec_config").update({
              anti_invite: 1,
            });

            const embedT = new EmbedBuilder()
              .setDescription(
                "Configuração feita! Você optou por utilizar a segurança de convites!"
              )
              .setColor(config.color);

            return interaction.reply({ embeds: [embedT], ephemeral: true });
          }

          if (trueorfalse === "não" || trueorfalse === "nao") {
            await knex("protec_config").update({
              anti_invite: 0,
            });

            const embed404 = new EmbedBuilder()
              .setDescription(
                "Configuração feita! Você selecionou para não usar a segurança de convites!"
              )
              .setColor(config.color);

            return interaction.reply({ embeds: [embed404], ephemeral: true });
          }
        }
      }
    }
  });
};
