const { Events, ChannelType } = require('discord.js');

module.exports = {
    name : Events.MessageCreate,
    once :  false,
    async execute(message){
        if(message.author.bot){
            return
        } else {
            if(message.channel.isDMBased()){
                console.log(`[DM]${message.author.tag} :${ message.content}`)
            } else {
            console.log(`[${message.guild.name}]${message.author.tag} On #${message.channel.name} : ${message.content}`)
        }
        }
}

}