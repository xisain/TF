const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');
const serviceAccount = require('../../keys/project-mco-firebase-adminsdk-tqfgp-d86a73fc0e.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            type: process.env.FIREBASE_TYPE,
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: process.env.FIREBASE_AUTH_URI,
            token_uri: process.env.FIREBASE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        }),
        databaseURL: process.env.DEFAULTDB,
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agent')
        .setDescription('Get information about an agent')
        .addStringOption(option => option.setName('name').setDescription('Name of the agent')),
    async execute(interaction) {
        function getRandomColor() {
            // Generate a random hexadecimal color code
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        const rawAgentName = interaction.options.getString('name');
        const agentName = rawAgentName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

        // Fetch agent data from Firebase Realtime Database
        const databaseRef = admin.database().ref('/agent');
        const snapshot = await databaseRef.once('value');
        const agents = snapshot.val();

        var embed = new EmbedBuilder();

        if (!agentName) {
            // If no specific agent is mentioned, create embed for all agents
            Object.keys(agents).forEach((agentKey) => {
                const agent = agents[agentKey];
                embed.addFields({ name: agent.name, value: agent.deskripsi });
            });
        } else {
            // If a specific agent is mentioned, create embed for that agent
            const agent = agents[agentName];

            if (agent) {
                embed.setTitle(agent.name)
                    .setDescription(agent.deskripsi)
                    .addFields(
                        { name: 'Skill 1', value: agent.skill.skill_1 },
                        { name: 'Skill 2', value: agent.skill.skill_2 },
                        { name: 'Skill 3', value: agent.skill.skill_3 },
                        { name: 'Ultimate', value: agent.skill.ultimate }
                    )
                    .setThumbnail(agent.img)
                    .setColor(getRandomColor());
            } else {
                embed.setDescription(`Agent "${agentName}" not found.`);
            }
        }

        return interaction.reply({ embeds: [embed] });
    },
};
