const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('player')
        .setDescription('Provides some important player info.')
        .addUserOption(option => 
            option
                .setName('player')
                .setDescription('Player to view')
                .setRequired(true)
        ),    
        async execute(interaction, jwt) {

            const infoDoc = new GoogleSpreadsheet('1BrPCgisbosG1TDDctmq4iS3gzTfFW8HzGzoefnD4AzE', jwt);
            await infoDoc.loadInfo();
            const infoSheet = infoDoc.sheetsByIndex[1];
            const characterSheet = infoDoc.sheetsByIndex[9];
            let rows = await infoSheet.getRows();
            let charRows = await characterSheet.getRows();

            const playerNames = []

            rows.forEach( row => {
                playerNames.push(row.get('Discord'));
            })

            const player = interaction.options.getUser('player');

            if (playerNames.indexOf(player.username) == -1) {
                await interaction.reply(`Sorry, but ${player.username} is not a westmarches player yet!`);
                return;
            }

            const playerRow = rows[playerNames.indexOf(player.username)];
            const charRow = charRows[playerNames.indexOf(player.username)];
            
            // const portrait = (playerRow.get('Portrait') === undefined ? player.displayAvatarURL({dynamic: true}) :  playerRow.get('Portrait'));
            const portrait = player.displayAvatarURL({dynamic: true});
            const characterName = playerRow.get('Character Name');
            const race = playerRow.get('Race');
            const level = playerRow.get('Expected Level');
            const sessions = playerRow.get('Sessions Played');
            const class1 = playerRow.get('Class 1');
            const class2 = playerRow.get('Class 2');
            const gold = playerRow.get('Gold');
            const bio = ((charRow.get('Bio') === undefined || charRow.get('Bio') === '') ? `*${characterName} is a level ${level} ${race} ${(class2 == '' ? `${class1.split(' ')[0]}` : `${class1}, ${class2}`)}.*` : `*${charRow.get('Bio')}*`);

            const playerEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`${characterName}`)
                .setThumbnail(portrait)
                .addFields(
                    { name: 'Sessions Played', value: `${sessions}`},
                    { name: 'Level', value: `${level}`},
                    { name: 'Gold', value: `${gold}`},
                    { name: 'Race', value: `${race}`},
                    { name: (class2 == '' ? `Class` : `Classes`), value: (class2 == '' ? `${class1.split(' ')[0]}` : `${class1}, ${class2}`) },
                    { name: 'Bio', value: bio}
                );

            await interaction.reply({ embeds: [playerEmbed] });
    },
};