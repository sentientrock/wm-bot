const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update-player')
        .setDescription('Update your West Marches character with a bio!')
        .addStringOption( option => 
            option
                .setName('bio')
                .setDescription(`The text you would like as your characters bio.`)
        ),
        async execute(interaction, jwt) {

            const infoDoc = new GoogleSpreadsheet('1BrPCgisbosG1TDDctmq4iS3gzTfFW8HzGzoefnD4AzE', jwt);
            await infoDoc.loadInfo();
            const infoSheet = infoDoc.sheetsByIndex[9];
            let rows = await infoSheet.getRows();

            const playerNames = [];

            rows.forEach( row => {
                playerNames.push(row.get('Discord'));
            })

            const player = interaction.user;

            if (playerNames.indexOf(player.username) == -1) {
                await interaction.reply(`Sorry, but you aren't a West Marches player yet!`);
                return;
            }

            const playerRow = rows[playerNames.indexOf(player.username)];

            if (interaction.options.getString('bio') !== null) {
                const bio = interaction.options.getString('bio');

                playerRow.set('Bio', bio);
                await playerRow.save();
            }

            await interaction.reply({ content: `Your character bio was succesfully updated! Use /player to check out your new character :)` });

        }

}