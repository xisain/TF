const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require ('dotenv')
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1'
const spotifyclientid = process.env.spotify_client
const spotifysecret = process.env.spotify_secret

let accessToken = null
let expire = 0;

async function getNewAccessToken(){
 const auth = Buffer.from(`${spotifyclientid}:${spotifysecret}`).toString('base64');
 try {
const tokenresponse = await axios.post(
    'https://accounts.spotify.com/api/token', 
    'grant_type=client_credentials',
    { headers: { 
        Authorization:`Basic ${auth}`,
        'content-type': 'application/x-www-form-urlencoded',
    }
    }   
    );
    return tokenresponse.data
 } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
}

module.exports = {
    data : new SlashCommandBuilder()
    .setName('findsong')
    .setDescription('Find a song using spotift API')
    .addStringOption(option => option.setName('name').setDescription('Name of music')),
    async execute(interaction){
            const pilihan = interaction.options.getString('name');
            if(pilihan == null){
                
                return interaction.reply("data tidak di temukan")
            } else {
                try {
                    const tokenData = await getNewAccessToken();
                    const response = await axios.get(
                        `${SPOTIFY_API_BASE_URL}/search?q=${encodeURIComponent(pilihan)}&type=track`,
                        {
                            headers : {
                                Authorization: `Bearer ${tokenData.access_token}`,
                            },
                        }
                    )
        
                    const track = response.data.tracks.items[0];
                    if(track){
                        //console.log(track.album.release_date)
                        const found = new EmbedBuilder() 
                        .setAuthor({ name: 'Spotify Song', iconURL: 'https://i.imgur.com/qvdqtsc.png', url: `${track.external_urls.spotify}` })
                        .setTitle(track.name)
                        .setURL(track.external_urls.spotify)
                        .addFields(
                            {name: 'Release Date', value: `${track.album.release_date}` ,inline : true},
                            { name: '\u200b', value: '\u200b', inline: true,},
                            {name: 'Artist', value: track.artists.map(artist => artist.name).join(', '), inline : true},
                            {name: 'Album', value: track.album.name, inline: true},
                            { name: '\u200b', value: '\u200b', inline: true,},
                            {name: 'Preview URL', value: `[${track.name}](${track.preview_url})`,inline: true})
                            .setThumbnail(track.album.images[1].url)
                            .setTimestamp()
                            .setColor('#1DB954')
                            .setFooter({ text: `requested by ${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL()}` });
                        return interaction.reply({ embeds: [found] });
                    } else {
                        return interaction.reply("data tidak di temukan")
                    }
        
                
                } catch (error) {
                    console.error('Error searching for song:', error);
                    interaction.reply('An error occurred while searching for the song.');
                }
            }
            
     }


}
