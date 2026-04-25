require('dotenv').config(); // ✅ AJOUT

const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const SALON_CANDIDATURE = "1495469431390867671";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// ✅ Bot prêt (CORRIGÉ)
client.once('ready', () => { // ✅ CORRECTION
  console.log('👮 Direction centrale connectée');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // 🔹 PING
  if (message.content === '!ping') {
    return message.reply('🏓 Pong !');
  }

  // 🔹 REGLEMENT
  if (message.content === '!reglement') {
    return message.channel.send(
      "👮 **Direction centrale de la police nationale**\n\n" +
      "📜 Respectez le règlement.\n\n" +
      "📜 https://docs.google.com/document/d/1-lHXt_m5BCpHjOqxKfsxnyLeNNseiUAl1hoIE_GJ2JY/edit\n" +
      "📘 https://docs.google.com/document/d/11YQp54kLrXkh3zw2nC2Nxp9O-AvjCuOU8aoJ9ksH-6Y/edit"
    );
  }

  // 🔥 TENUES
  if (message.content === '!tenues') {
    const embeds = [
      new EmbedBuilder()
        .setTitle('👮 Tenue EGPX - Service')
        .setImage('https://media.discordapp.net/attachments/1334091154039504907/1495020167061835966/IMG_2712.jpg'),

      new EmbedBuilder()
        .setTitle('👮 Tenue GPX')
        .setImage('https://media.discordapp.net/attachments/1334091154039504907/1495020167577600143/IMG_2722.jpg'),

      new EmbedBuilder()
        .setTitle('🎖️ Commandement')
        .setImage('https://media.discordapp.net/attachments/1334091154039504907/1495020169959833690/IMG_2709.jpg')
    ];

    return message.channel.send({ embeds });
  }

  // 🔰 HIERARCHIE
  if (message.content.toLowerCase().includes('!hierarchie')) {
    const embed = new EmbedBuilder()
      .setTitle('👮 Hiérarchie de la Police Nationale')
      .setColor(0x2c3e50)
      .addFields(
        { name: '🎓 École', value: 'Élève Gardien de la Paix\nRespect : Aucun' },
        { name: '👮 Corps Encadrement', value: 'GPXS / GPX / BRC / MAJ' },
        { name: '🎖️ Commandement', value: 'CPE / CPS / LTN / CPT / CMD' },
        { name: '⭐ Direction', value: 'Commissaire → Commissaire Général' }
      );

    return message.channel.send({ embeds: [embed] });
  }

  // 📩 POSTULER
  if (message.content === '!postuler') {
    try {
      const dm = await message.author.createDM();

      const questions = [
        "Nom Prénom :",
        "Date de naissance :",
        "Âge :",
        "Mail Discord :",
        "Situation actuelle :",
        "Niveau d’étude :",
        "Diplôme(s) :",
        "Pourquoi rejoindre la police ?",
        "Depuis quand ?",
        "3 qualités :",
        "3 défauts :",
        "Travail en équipe ?",
        "Situation stressante ?",
        "Déjà enfreint une règle ?",
        "Réaction face à l’autorité :",
        "Travail de nuit ? OUI / NON",
        "Week-end ? OUI / NON",
        "Stress /10 :",
        "Discipline /10 :",
        "Motivation /10 :",
        "Signature :",
        "Date :"
      ];

      await dm.send(
        "👮 **FORMULAIRE POLICE NATIONALE**\n\n" +
        questions.map((q, i) => `**${i + 1}.** ${q}`).join("\n") +
        "\n\n✏️ Réponds en **UN SEUL MESSAGE** ligne par ligne."
      );

      const filter = m => m.author.id === message.author.id;

      const collected = await dm.awaitMessages({
        filter,
        max: 1,
        time: 600000
      });

      if (!collected.size) return dm.send("❌ Temps écoulé.");

      const réponses = collected.first().content.split("\n");

      if (réponses.length < questions.length) {
        return dm.send("❌ Merci de répondre à toutes les questions.");
      }

      const salon = message.guild.channels.cache.get(SALON_CANDIDATURE);
      if (!salon) return console.log("❌ Salon introuvable");

      console.log("📩 Envoi candidature...");

      const embed = new EmbedBuilder()
        .setTitle('📩 Nouvelle candidature')
        .setDescription(`Candidat : ${message.author.tag}`)
        .setColor(0x3498db);

      questions.forEach((q, index) => {
        let réponse = réponses[index] || "Non renseigné";

        if (réponse.length > 1024) {
          réponse = réponse.slice(0, 1020) + "...";
        }

        embed.addFields({
          name: q,
          value: réponse
        });
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`accept_${message.author.id}`)
          .setLabel('✅ Accepter')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(`refuse_${message.author.id}`)
          .setLabel('❌ Refuser')
          .setStyle(ButtonStyle.Danger)
      );

      await salon.send({ embeds: [embed], components: [row] });

      await dm.send("✅ Candidature envoyée au commissaire.");

    } catch (err) {
      console.log(err);
      message.reply("❌ Active tes messages privés.");
    }
  }
});

// 🔘 BOUTONS
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const userId = interaction.customId.split('_')[1];
  const user = await client.users.fetch(userId).catch(() => null);
  if (!user) return;

  if (interaction.customId.startsWith('accept')) {
    await user.send("✅ Ta candidature est acceptée. Nous vous recontacterons pour un prochain entretien.");
    return interaction.reply({ content: "Accepté", ephemeral: true });
  }

  if (interaction.customId.startsWith('refuse')) {
    await user.send("❌ Ta candidature a été refusée. Si tu as des questions, n'hésite pas à nous contacter.");
    return interaction.reply({ content: "Refusé", ephemeral: true });
  }
});

// 🔥 AJOUT FINAL OBLIGATOIRE
client.login(process.env.TOKEN);
