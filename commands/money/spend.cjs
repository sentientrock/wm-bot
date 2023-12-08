const { SlashCommandBuilder } = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spend')
        .setDescription('Spend money on something!')
        .addIntegerOption(option => 
            option
                .setName('amount')
                .setDescription('Amount of money to spend')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('message')
                .setDescription('Description of what you spent money on')
                .setRequired(true)
        ),
        async execute(interaction, jwt) {
            const infoDoc = new GoogleSpreadsheet('1BrPCgisbosG1TDDctmq4iS3gzTfFW8HzGzoefnD4AzE', jwt);
            await infoDoc.loadInfo();
            const moneySheet = infoDoc.sheetsByIndex[3];
            const number = interaction.options.getInteger('amount');

            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const currDate = mm + '/' + dd;

            const moneyMessage = interaction.options.getString('message');

            if (number === null) {
                await interaction.reply({ content: `Please enter an integer amount when spending money :)`});
                return;
            }
            
            // await moneySheet.addRow({Disc: `${interaction.user.username}`, Transaction: `-${number}`, Note: `${moneyMessage}`, Date: `${currDate}`});
            await interaction.reply({ content: `You successfully spent ${number} gold!`});
        }
}