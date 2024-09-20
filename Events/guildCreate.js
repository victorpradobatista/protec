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
const fs = require("fs");

const knex = require("knex")({
    client: "sqlite3",
    connection: {
      filename: "./json.sqlite",
    },
    useNullAsDefault: true,
  });

module.exports = async (client, interaction) => {
  client.on("guildCreate", async (guild) => { 
    const SlashsArray = [];

    fs.readdir(`./Comandos`, (error, folders) => {
      if (error) {
          console.log(error);
          return;
      }

      folders.forEach((folder) => {
          fs.readdir(`./Comandos/${folder}/`, (error, files) => {
              if (error) {
                  console.log(error);
                  return;
              }
              files.forEach((file) => {
                  if (!file.endsWith('.js')) return;

                  const filePath = `../Comandos/${folder}/${file}`;
                  const fileModule = require(filePath);

                  if (!fileModule.name) return;
                  client.slashCommands.set(fileModule.name, fileModule);

                  SlashsArray.push(fileModule);
              });
          });
      });
  });

    let selectPerms = await knex("protec_perms").select('*').where({
      id: guild.id
    })
    let selectAll = await knex("protec_config").select("*").where({
        id_guild: guild.id,
      });
    let cfg = await knex('protec_path').select('*').where({
      id: guild.id
    })
    let cfg2 = await knex('protec_contagems').select('*').where({
      id_guild: guild.id
    })
    if(cfg == false) {
        await knex('protec_path').insert({
            id: guild.id
        })
    }
    if(cfg2 == false) {
      await knex('protec_contagems').insert({
        id_guild: guild.id,
      })
    }
    if(selectPerms == false) {
      await knex('protec_perms').insert({
        id: guild.id,
        name: guild.name,
        permission: 'None'
      })
    }
    if(selectAll == false) {
        await knex('protec_config').insert({
            id_guild: guild.id,
            anti_invite: 1,
            invite_channels: 'none',
            max_members: 10,
            logs: null,
            ticket: null,
            ticket_category: null,
            ticket_desc: 'Configure utilizando /config'
          })
    }
  })
};
