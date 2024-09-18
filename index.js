const Discord = require("discord.js");
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
const config = require("./config.json");
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

module.exports = client;

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./json.sqlite",
  },
  useNullAsDefault: true,
});

client.on("interactionCreate", (interaction) => {
  if (interaction.type === Discord.InteractionType.ApplicationCommand) {
    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return interaction.reply(`Error`);
    interaction["member"] = interaction.guild.members.cache.get(
      interaction.user.id
    );
    cmd.run(client, interaction);
  }
});

client.on("ready", () => {

  setInterval(async () => {
    let dataAtual = new Date();
    let dia = dataAtual.getDate().toString().padStart(2, '0');
    let mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    let ano = dataAtual.getFullYear().toString();
    let dataFormatada = dia + mes + ano;

    let select = await knex('protec_vip').select('*').where({date_expired: dataFormatada})

    if(select == false) {
      console.log('Nenhum VIP removido!')
    } else {
      const guild = await client.guilds.fetch(select[0].guild_id);
      const logs = await knex('protec_config').select('*').where({id_guild: select[0].guild_id})
      const member = await guild.members.fetch(select[0].user_id);
      const role = await guild.roles.fetch(select[0].cargo_id);
      const channelLog = await guild.channels.fetch(logs[0].logs)
      const guildOwner = await client.guilds.fetch('1243216683112464385');
      const channelOwner = await guildOwner.channels.fetch('1285243452618969182');

      if(logs == false) {
        return;
      } else {
        const embed = new EmbedBuilder()
        .setTitle(`Vip Expirado`)
        .setDescription(`O vip foi removido com sucesso!`)
        .addFields(
          {name: 'Usuário', value: `${select[0].user_id}`, inline: true}
        )
        .setColor(config.color)
        channelLog.send({embeds: [embed]})
      }

      const embed = new EmbedBuilder()
      .setTitle(`Vip Removido`)
      .setDescription(`O vip foi removido com sucesso!`)
      .addFields(
        {name: 'Guild', value: `${select[0].guild_id}`, inline: true}
      )
      .setColor(config.color)
      channelOwner.send({embeds: [embed]})
      await member.roles.remove(role);
      await knex('protec_vip').delete().where({date_expired: dataFormatada})
    }
  }, 1 * 1000 * 120);

  console.log(`Olá! ${client.user.username}!`);
  const activitiest = [
    { name: "Protec - Seu servidor protegido com eficiência!", status: "idle" },
    { name: "Protec - Já foram mais de 54 usuários punidos!", status: "idle" },
    {
      name: "Protec - Proteja sua comunidade com agilidade e confiança!",
      status: "idle",
    },
  ];
  let i = 0;
  setInterval(() => {
    if (i > 2) {
      i = 0;
    } else {
      client.user.setPresence({
        activities: [{ name: activitiest[i].name }],
        status: activitiest[i].status,
      });
      i++;
      // console.log(i)
    }
  }, 1000 * 60 * 1);
});

client.slashCommands = new Discord.Collection();
require("./Handler/handler.js")(client);
require("./Events/interactionCreate.js")(client);
require("./Events/guildMemberAdd.js")(client);
require("./Events/guildMemberRemove.js")(client);
require("./Events/messageCreate.js")(client);
require("./Events/ticketEvent.js")(client);
require("./Events/guildCreate.js")(client);

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception: " + err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log(promise, reason.message);
});

process.on("unhandledRejection", (reason, p) => {
  console.log(reason, p);
});

process.on("uncaughtException", (err, origin) => {
  console.log(err, origin);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(err, origin);
});

client.login(config.token);
