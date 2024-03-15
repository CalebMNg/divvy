const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const { openDb } = require("../handlers/databaseHandler.js");
const { MAX_GROUP_LINES } = require("../constants.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("Shows previous groups made in this server."),

  async execute(interaction) {
    let db = await openDb();

    let groups = (
      await db.all(
        "SELECT groupid, groupname, state, created FROM groups WHERE serverid = ?",
        [interaction.guild.id]
      )
    ).reverse();

    //Make embeded messages
    const embedPages = [];

    const numGroups = groups.length;
    const numPages = Math.ceil(numGroups / MAX_GROUP_LINES);

    for (let i = 0; i < numPages; i++) {
      embedPages[i] = new EmbedBuilder()
        .setTitle("History")
        .setFooter({ text: i + 1 + "/" + numPages });

      let lastGroup = Math.min(MAX_GROUP_LINES * (i + 1), numGroups);
      let pageData = "";
      for (let j = MAX_GROUP_LINES * i; j < lastGroup; j++) {
        pageData += groups[j].groupid + ") " + groups[j].groupname + "\n";
      }
      embedPages[i].setDescription(pageData);
    }

    const up = new ButtonBuilder()
      .setCustomId("up")
      .setEmoji("⬇️")
      .setStyle(ButtonStyle.Primary);
    const down = new ButtonBuilder()
      .setCustomId("down")
      .setEmoji("⬆️")
      .setStyle(ButtonStyle.Primary);

    const allButtons = new ActionRowBuilder().addComponents(up, down);
    up.setDisabled(true);

    let message = await interaction.reply({
      embeds: [embedPages[0]],
      components: [allButtons],
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (i) => {
      id = i.customId;
    });
  },
};
