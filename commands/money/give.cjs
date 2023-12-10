const { SlashCommandBuilder } = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give money to another player!')
        .addUserOption(option => 
            option
                .setName('player')
                .setDescription('The player to give money to')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount to give')
                .setRequired(true)   
        ),
        async execute(interaction, jwt) {
            const infoDoc = new GoogleSpreadsheet('1BrPCgisbosG1TDDctmq4iS3gzTfFW8HzGzoefnD4AzE', jwt);
            await infoDoc.loadInfo();
            const moneySheet = infoDoc.sheetsByIndex[3];
            const number = interaction.options.getInteger('amount');
            const player = interaction.options.getUser('player');

            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const currDate = mm + '/' + dd;

            if (number === null) {
                await interaction.reply({ content: `Please enter an integer amount when spending money :)`});
                return;
            }

            if (number < 0) {
                await interaction.reply({ content: `Please enter a value greater than 0!`});
                return;
            }

            await moneySheet.addRow({Disc: `${interaction.user.username}`, Transaction: `-${number}`, Note: `${interaction.user.username} to ${player.username}`, Date: `${currDate}`});
            await moneySheet.addRow({Disc: `${player.username}`, Transaction: `${number}`, Note: `${interaction.user.username} to ${player.username}`, Date: `${currDate}`});

            await interaction.reply({ content: `You gave ${number} gold to ${player.username}!`})

        }
}
