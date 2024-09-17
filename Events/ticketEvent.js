const Discord = require("discord.js");
const config = require("../config.json");
const transcript = require('discord-html-transcripts')
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

const knex = require("knex")({
    client: "sqlite3",
    connection: {
      filename: "./json.sqlite",
    },
    useNullAsDefault: true,
  });

module.exports = async (client, interaction) => {
  client.on("interactionCreate", async (interaction) => {

    const attachment = await transcript.createTranscript(interaction.channel, {
        limit: -1, // Max amount of messages to fetch. `-1` recursively fetches.
        returnType: 'attachment', // Valid options: 'buffer' | 'string' | 'attachment' Default: 'attachment' OR use the enum ExportReturnType
        filename: `${interaction.channel.id}.html`, // Only valid with returnType is 'attachment'. Name of attachment.
        saveImages: true, // Download all images and include the image data in the HTML (allows viewing the image even after it has been deleted) (! WILL INCREASE FILE SIZE !)
        footerText: "Exported {number} message{s}", // Change text at footer, don't forget to put {number} to show how much messages got exported, and {s} for plural
        poweredBy: true, // Whether to include the "Powered by discord-html-transcripts" footer
        ssr: true // Whether to hydrate the html server-side
    });

    const poke = new ButtonBuilder()
    .setCustomId('poke')
    .setLabel('Poke')
    .setEmoji('🛎')
    .setStyle(ButtonStyle.Primary);

    const button_close = new ButtonBuilder()
    .setCustomId('button_close')
    .setLabel('Fechar Ticket')
    .setEmoji('❌')
    .setStyle(ButtonStyle.Danger);


    const protec_ticket_buttons = new ActionRowBuilder().addComponents(poke).addComponents(button_close);


    if(interaction.customId == 'button_close') {
        let select = await knex('protec_ticket').select('*').where({dono: interaction.user.id}).andWhere({guild: interaction.guild.id})
        let cfg = await knex('protec_config').select('*').where({id_guild: interaction.guild.id})
        if(select == false) {
            console.log('Error: 0001')
        } else {
                await knex('protec_ticket').where({dono: interaction.user.id}).andWhere({guild: interaction.guild.id}).delete()
                const channel = interaction.guild.channels.cache.get(cfg[0].logs)
                const embed = new EmbedBuilder()    
                .setTitle(`Transcript`)
                .setDescription(`Este documento contém uma transcrição completa das mensagens trocadas no ticket **${select[0].channel}** do usuário <@${select[0].dono}>. Abaixo estão todas as interações registradas entre o usuário e a equipe de suporte.`)
                .setColor(config.color)
                channel.send({embeds:[embed], ephemeral: true, files: [attachment]})
                interaction.channel.delete()
        }
    }
    if(interaction.customId == 'poke') {
        let select = await knex('protec_ticket').select('*').where({dono: interaction.user.id}).andWhere({guild: interaction.guild.id})
        if(select[0].dono == interaction.user.id) {
            const embed = new EmbedBuilder()
            .setDescription(`Isto é apenas para staffs!`)
            .setColor(config.color)
            interaction.reply({embeds: [embed], ephemeral: true})
        } else {
            const user = interaction.guild.members.cache.get(select[0].dono)

            const embed = new EmbedBuilder()
            .setDescription(`O staff ${interaction.user} respondeu seu ticket!`)
            .addFields(
                {name: 'Clique aqui!', value: `<#${select[0].channel}>`}
            )
            .setColor(config.color)
            interaction.reply({embeds: [embed], ephemeral: true})

            user.send('Poke')
        }
    }

    if(interaction.values == 'protec_duvidas') {
        let selectAll = await knex('protec_ticket').select('*').where({dono: interaction.user.id}).andWhere({guild: interaction.guild.id})
        if(selectAll != false) {
            const embed = new EmbedBuilder()
            .setDescription(`Seu ticket já está aberto! <#${selectAll[0].channel}>`)
            .setColor(config.color)
        } else if(selectAll == false){
        let select = await knex('protec_config').select('*').where({
            id_guild: interaction.guild.id
        })
        let selectTicket = await knex('protec_ticket').select('*').where({
            guild: interaction.guild.id
        })
        const role = interaction.guild.roles.cache.get(select[0].ticket_staff)

        if(selectTicket == false) {

        await knex('protec_ticket').insert({
            dono: interaction.user.id,
            type: 'Duvidas',
            transcript: null,
            guild: interaction.guild.id,
            channel: 'Atualizando'
        })

        interaction.guild.channels.create({
            name: `🔔ㅤ┋ㅤduvidas-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: select[0].ticket_category,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: role,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ]
                }
            ]
        }).then(async channel => {
            const embed = new EmbedBuilder()
            .setDescription(`Ticket criado com sucesso! <#${channel.id}>`)
            .setColor(config.color)
            await interaction.reply({embeds: [embed], ephemeral: true})
            await knex('protec_ticket').update({
                channel: channel.id
            }).where({
                guild: interaction.guild.id
            })

            const painelStaff = new EmbedBuilder()
            .setDescription(`**Seu ticket foi aberto com sucesso**. Nossa equipe está agora revisando a sua solicitação e entrará em contato com você em breve.

Agradecemos pela **paciência** e **confiança** em nosso suporte.`)
            .setColor(config.color)


            channel.send({embeds:[painelStaff], components: [protec_ticket_buttons]})
            })
        }
    }
}
    if(interaction.values == 'protec_outro') {
        let selectAll = await knex('protec_ticket').select('*').where({dono: interaction.user.id}).andWhere({guild: interaction.guild.id})
        if(selectAll != false) {
            const embed = new EmbedBuilder()
            .setDescription(`Seu ticket já está aberto! <#${selectAll[0].channel}>`)
            .setColor(config.color)
        } else if(selectAll == false){
        let select = await knex('protec_config').select('*').where({
            id_guild: interaction.guild.id
        })
        let selectTicket = await knex('protec_ticket').select('*').where({
            guild: interaction.guild.id
        })
        const role = interaction.guild.roles.cache.get(select[0].ticket_staff)

        if(selectTicket == false) {

        await knex('protec_ticket').insert({
            dono: interaction.user.id,
            type: 'Outro',
            transcript: null,
            guild: interaction.guild.id,
            channel: 'Atualizando'
        })

        interaction.guild.channels.create({
            name: `👥ㅤ┋ㅤoutro-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: select[0].ticket_category,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: role,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ]
                }
            ]
        }).then(async channel => {
            const embed = new EmbedBuilder()
            .setDescription(`Ticket criado com sucesso! <#${channel.id}>`)
            .setColor(config.color)
            await interaction.reply({embeds: [embed], ephemeral: true})
            await knex('protec_ticket').update({
                channel: channel.id
            }).where({
                guild: interaction.guild.id
            })

            const painelStaff = new EmbedBuilder()
            .setDescription(`**Seu ticket foi aberto com sucesso**. Nossa equipe está agora revisando a sua solicitação e entrará em contato com você em breve.

Agradecemos pela **paciência** e **confiança** em nosso suporte.`)
            .setColor(config.color)


            channel.send({embeds:[painelStaff], components: [protec_ticket_buttons]})
            })
        }
    }
}
    if(interaction.values == 'protec_denuncias') {
        let selectAll = await knex('protec_ticket').select('*').where({dono: interaction.user.id}).andWhere({guild: interaction.guild.id})
        if(selectAll != false) {
            const embed = new EmbedBuilder()
            .setDescription(`Seu ticket já está aberto! <#${selectAll[0].channel}>`)
            .setColor(config.color)
        } else if(selectAll == false){
        let select = await knex('protec_config').select('*').where({
            id_guild: interaction.guild.id
        })
        let selectTicket = await knex('protec_ticket').select('*').where({
            guild: interaction.guild.id
        })
        const role = interaction.guild.roles.cache.get(select[0].ticket_staff)

        if(selectTicket == false) {

        await knex('protec_ticket').insert({
            dono: interaction.user.id,
            type: 'Denuncias',
            transcript: null,
            guild: interaction.guild.id,
            channel: 'Atualizando'
        })

        interaction.guild.channels.create({
            name: `❌ㅤ┋ㅤdenuncia-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: select[0].ticket_category,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: role,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ]
                }
            ]
        }).then(async channel => {
            const embed = new EmbedBuilder()
            .setDescription(`Ticket criado com sucesso! <#${channel.id}>`)
            .setColor(config.color)
            await interaction.reply({embeds: [embed], ephemeral: true})
            await knex('protec_ticket').update({
                channel: channel.id
            }).where({
                guild: interaction.guild.id
            })

            const painelStaff = new EmbedBuilder()
            .setDescription(`**Seu ticket foi aberto com sucesso**. Nossa equipe está agora revisando a sua solicitação e entrará em contato com você em breve.

Agradecemos pela **paciência** e **confiança** em nosso suporte.`)
            .setColor(config.color)


            channel.send({embeds:[painelStaff], components: [protec_ticket_buttons]})
        })
    }
}
}
  });
};
