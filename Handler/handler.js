const fs = require("fs");

module.exports = async (client) => {

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

    client.on("ready", async () => {
        client.guilds.cache.forEach((guild) => {
            guild.commands.set(SlashsArray);
        });
    });
};