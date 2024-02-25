const { SlashCommandBuilder } = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bid')
        .setDescription('Bid on an item in Elouise\' Emporium!')
        .addIntegerOption(option => 
            option
                .setName('amount')
                .setDescription('Amount of money to bid')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('item')
                .setDescription('Item you are bidding on!')
                .setRequired(true)
        ),
        async execute(interaction, jwt) {
            const infoDoc = new GoogleSpreadsheet('1BrPCgisbosG1TDDctmq4iS3gzTfFW8HzGzoefnD4AzE', jwt);
            await infoDoc.loadInfo();
            const bidSheet = infoDoc.sheetsByIndex[8];
            const number = interaction.options.getInteger('amount');
            const player = interaction.user.username;
            const item = interaction.options.getString('item')

            if (number === null) {
                await interaction.reply({ content: `Please enter an integer amount when spending money :)`});
                return;
            }

            if (number < 0) {
                await interaction.reply({ content: `Please enter a value greater than 0!`});
                return;
            }
            
            await bidSheet.addRow({Disc: `${player}`, Amount: `${number}`, Item: `${item}`});
            await interaction.reply({ content: `${player} has succesfully bid ${number} gold on ${item}!`});
        }
}