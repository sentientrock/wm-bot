import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import creds from './westmarches-gtdnd-a61b9d5c621a.json' assert { type: "json" };

const token = 'MTE2NjU4OTc2MDc2OTM2Mzk3OQ.' + 'G5monx.9tRR6pjyjqjhX1SZGxa1q9srOsMad2xFFe9DiE';
const questChannelId = "1172619608285515856";

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ];
  
const jwt = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
});

const doc = new GoogleSpreadsheet('1oZjmblbPh9CAGv-RLoF_Zx-JO6tdlC3QiTcCQKpD7k0', jwt);

await doc.loadInfo();
const sheet = doc.sheetsByIndex[0];
let rows = await sheet.getRows();
const rowMessageIds = [];
const rowQuestIds = [];

rows.forEach( row => {
    rowMessageIds.push(row.get('messageId'))
    rowQuestIds.push(row.get('reactionMessageId'))
});

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.channel.id === questChannelId && message.author != client.user) {
        const questTitle = message.content.split(/\r?\n/)[0];
        const questReact = await message.reply(`React with ⚔️ to this message to signup for **${questTitle}**!\n\nCurrently, there are no players singned up.`);

        await sheet.addRow( {questName : questTitle, messageId : message.id, reactionMessageId: questReact.id} );
        rows = await sheet.getRows();
        rowMessageIds.push(message.id);
        rowQuestIds.push(questReact.id);
        
    }
});

client.on('messageReactionAdd', async (reaction, user) => {

    if (reaction.message.channel.id === questChannelId && rowQuestIds.includes(reaction.message.id) && reaction.emoji.name === '⚔️') {

        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong while fetching the reaction!');
                return;
            }
        }
        
        let fullPlayerList = ['test'];

        rows = await sheet.getRows();
        rows.forEach( row => {
            fullPlayerList = fullPlayerList.concat(row.get('players').split(/\r?\n/));
        });
    
        if (fullPlayerList.includes(user.id)) {

            user.send({content : 'Unfortunately, you can only sign up for one quest in a specific week. Please make sure you are not signed up for any other quests during the week before choosing another one! If you believe this is an error, please reach out to one of our DMs :)'});

            const userReactions = reaction.message.reactions.cache.filter(react => react.users.cache.has(user.id));
            try {
                for (const reaction of userReactions.values()) {
                    await reaction.users.remove(user.id);
                }
            } catch (error) {
                console.error('failed to remove reaction :(');
            }
            
            return;
        }

        const questIndex = rowQuestIds.indexOf(reaction.message.id);
        const currentPlayers = rows[questIndex].get('players');

        if (currentPlayers === '') {
            rows[questIndex].set('players', user.id);
        } else {
            rows[questIndex].set('players', currentPlayers + `\n${user.id}`)
        }

        await rows[questIndex].save();

        questUpdate(reaction.message.id, rows[questIndex].get('questName'), questIndex);

    }

});

client.on('messageReactionRemove', async (reaction, user) => {

    if (reaction.message.channel.id === questChannelId && rowQuestIds.includes(reaction.message.id) && reaction.emoji.name === '⚔️') {

        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong while fetching the reaction!');
                return;
            }
        }

        const questIndex = rowQuestIds.indexOf(reaction.message.id);
        const currentPlayers = rows[questIndex].get('players').split(/\r?\n/);
        currentPlayers.splice(currentPlayers.indexOf(user.id), 1);
        rows[questIndex].set('players', currentPlayers.join(''))
        await rows[questIndex].save();

        questUpdate(reaction.message.id, rows[questIndex].get('questName'), questIndex);
    }

});

async function questUpdate(reactionMessageId, questTitle, questIndex) {
    const reactionMessageChannel = client.channels.cache.get(questChannelId);
    const reactionMessage = await reactionMessageChannel.messages.fetch(reactionMessageId);
    
    rows = await sheet.getRows();
    const currentQuest = rows[questIndex];
    const playerList = currentQuest.get('players').split(/\r?\n/);

    const max = 5;

    if (playerList[0] != '' ) {
        if (playerList.length <= max) {
            reactionMessage.edit(`React to this message to signup for **${questTitle}**!\n\nPlayers: ${`<@${playerList.join('>, <@')}>`}`)
        } else {
            reactionMessage.edit(`React to this message to signup for **${questTitle}**!\n\nPlayers: ${`<@${playerList.slice(0, max).join('>, <@')}>`}\n\nWaitlist: ${`<@${playerList.slice(max).join('>, <@')}>`}`)
        }
    } else {
        reactionMessage.edit(`React to this message to signup for **${questTitle}**!\n\nCurrently, there are no players singned up.`)
    }
}

client.login(token);