const {
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
} = require("discord.js");

const { openDb } = require("../handlers/databaseHandler.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Creates a group as an embeded message.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the group.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The description of the group.")
    ),

  async execute(interaction) {
    const confirm = new ButtonBuilder()
      .setCustomId("join")
      .setLabel("Join")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(confirm);

    let description = interaction.options.getString("description");
    if (!description) description = "This is the default description.";
    const groupname = interaction.options.getString("name");

    let embeded = new EmbedBuilder()
      .setTitle(groupname)
      .setDescription(description);

    const response = await interaction.reply({
      embeds: [embeded],
      components: [row],
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    let db = await openDb();

    //add group to groups table
    const groupid = (
      await db.get(
        "SELECT COUNT(groupid) AS count FROM groups WHERE serverid = ?",
        [interaction.guild.id]
      )
    ).count;
    let sql =
      "INSERT INTO groups (serverid, groupid, groupname) VALUES (?, ?, ?)";
    await db.run(sql, [interaction.guild.id, groupid, groupname]);

    //join people
    collector.on("collect", async (i) => {
      let sql =
        "SELECT 1 FROM groupusers WHERE serverid = ? AND groupid = ? AND userid = ?";
      let exists =
        (await db.get(sql, [interaction.guild.id, groupid, i.user.id])) != null;
      if (exists) {
        let sql =
          "DELETE FROM groupusers WHERE serverid = ? AND groupid = ? AND userid = ?";
        await db.run(sql, [interaction.guild.id, groupid, i.user.id]);
        await i.reply({
          content: `You have been removed from the group ${groupname}.`,
          ephemeral: true,
        });
      } else {
        let sql =
          "INSERT INTO groupusers (serverid, groupid, userid) VALUES (?, ?, ?)";
        await db.run(sql, [interaction.guild.id, groupid, i.user.id]);
        await i.reply({
          content: `You have been added from the group ${groupname}.`,
          ephemeral: true,
        });
      }
    });
  },
};
