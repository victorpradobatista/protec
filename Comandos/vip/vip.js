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
const interactionCreate = require("../../Events/interactionCreate");

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./json.sqlite",
  },
  useNullAsDefault: true,
});

module.exports = {
  name: `vip`,
  description: "Adicionar vip.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "Usuário que efetuou a compra.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "tempoduracao",
      description: "Tempo de duração ex: 30",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
        name: "cargoid",
        description: "Id do cargo VIP",
        type: Discord.ApplicationCommandOptionType.Role,
        required: true,
    },
  ],

  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const tempoduracao = interaction.options.getString("tempoduracao");
    const cargoid = interaction.options.getRole("cargoid");
    let perms = await knex('protec_perms').select('*').where({
        id: interaction.guild.id
    })
    let select = await knex('protec_vip').select('*').where({
        user_id: user.id,
    }).andWhere({
        guild_id: interaction.guild.id
    })

    let dataAtual = new Date();
    let dia = dataAtual.getDate().toString().padStart(2, '0');
    let mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    let ano = dataAtual.getFullYear().toString();
    let dataFormatada = dia + mes + ano;

    function adicionarDias(data, dias) {
        let novaData = new Date(data);
        novaData.setDate(novaData.getDate() + dias);
        return novaData;
    }

    let dataFinal = adicionarDias(dataAtual, parseInt(tempoduracao));

    let expireDay = dataFinal.getDate().toString().padStart(2, '0');
    let expireMonth = (dataFinal.getMonth() + 1).toString().padStart(2, '0'); // getMonth() retorna 0 para janeiro, então adiciona-se 1
    let expireYear = dataFinal.getFullYear().toString();
    let expireDate = expireDay + expireMonth + expireYear;

    if(perms[0].permission == 'Bronze') {
        if(select == false) {
            await knex('protec_vip').insert({
                user_id: user.id,
                cargo_id: `${cargoid.id}`,
                date_buy: dataFormatada,
                date_expired: expireDate,
                duration_time: parseInt(tempoduracao) + ' Dias',
                guild_id: interaction.guild.id
            })

            const embed = new EmbedBuilder()
            .setTitle('Vip Adicionado')
            .setDescription(`O vip ${cargoid} foi adicionado com sucesso no user <@${user.id}> pelo staff <@${interaction.user.id}>`)
            .addFields(
                {name: 'Duração', value: `${parseInt(tempoduracao)} Dias`, inline: true},
                {name: 'Quem recebeu', value: `<@${user.id}>`, inline: true},
                {name: 'Vip', value: ` ${cargoid}`, inline: true}
            )
            .setColor(config.color)
            const member = interaction.guild.members.cache.get(user.id)
            member.roles.add(cargoid)
            interaction.reply({embeds:[embed], ephemeral: true})
        } else {
            let selectVip = await knex('protec_vip').select('*').where({user_id: user.id}).andWhere({guild_id: interaction.guild.id})
            const removeROLE = interaction.guild.roles.cache.get(selectVip[0].cargo_id)
            const member = interaction.guild.members.cache.get(user.id)
            member.roles.remove(removeROLE).then((result) => {
                member.roles.add(cargoid)
            }).catch((err) => {
                console.log(err)
            });
            await knex('protec_vip').update({
                cargo_id: `${cargoid.id}`,
                date_buy: dataFormatada,
                date_expired: expireDate,
                duration_time: parseInt(tempoduracao) + ' Dias',
            }).where({
                user_id: user.id
            }).andWhere({
                guild_id: interaction.guild.id
            })

            const embed = new EmbedBuilder()
            .setTitle('Vip Adicionado')
            .setDescription(`O vip ${cargoid} foi adicionado com sucesso no user <@${user.id}> pelo staff <@${interaction.user.id}>`)
            .addFields(
                {name: 'Duração', value: `${parseInt(tempoduracao)} Dias`, inline: true},
                {name: 'Quem recebeu', value: `<@${user.id}>`, inline: true},
                {name: 'Vip', value: ` ${cargoid}`, inline: true}
            )
            .setColor(config.color)
            interaction.reply({embeds:[embed], ephemeral: true})
        }
    } else {
        const embed = new EmbedBuilder()
        .setDescription('Você não possuê o `VIP Protec` para utilizar está funcionalidade!')
        .setColor(config.color)

        interaction.reply({embeds: [embed], ephemeral: true})
    }

  },
};
