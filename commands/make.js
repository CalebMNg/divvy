const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");

const { openDb } = require("../handlers/databaseHandler.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("make")
    .setDescription("Creates groupings from people added in a group.")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription(
          "The id of the group. The id is displayed on the original group message."
        )
        .setMinValue(0)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("size")
        .setDescription("The size that the bot will attempt to make groups of.")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(
          "the channel the groupings will be sent to. Defaults to the channel the command is sent in."
        )
        .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread)
    ),

  async execute(interaction) {
    let groupid = interaction.options.getInteger("id");
    let groupsize = interaction.options.getInteger("size");
    let channel = interaction.options.getChannel("channel");
    if (!channel) channel = interaction.channel;

    let db = await openDb();

    let sqlgroupdata =
      "SELECT groupname FROM groups WHERE serverid = ? AND groupid = ?";
    let groupdata = await db.get(sqlgroupdata, [interaction.guild.id, groupid]);
    //invalid groupid
    if (!groupdata) {
      await interaction.reply({
        content: "This group ID does not exist. Use /history to see all past groups and ids.",
        ephemeral: true,
      });
      return;
    }

    let sqlusers =
      "SELECT userid FROM groupusers WHERE serverid = ? AND groupid = ?";
    let datausers = await db.all(sqlusers, [interaction.guild.id, groupid]);
    //too small of a group or too large of a size
    if (datausers.length <= groupsize) {
      await interaction.reply({
        content: "The group is too small or the grouping size is too large.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    let numgroupings = Math.ceil(datausers.length / groupsize);
    let groupings = [];

    for (let i = 0; i < numgroupings; i++) groupings.push([]);

    let length = datausers.length
    for (let i = 0; i < length; i++) {
      let selectedgrouping = i % numgroupings;
      let selecteduser = Math.floor(Math.random() * datausers.length);

      groupings[selectedgrouping].push(datausers[selecteduser].userid);

      datausers.splice(selecteduser, 1);
    }

    let embed = new EmbedBuilder().setTitle(groupdata.groupname);

    for (let i = 0; i < groupings.length; i++) {

      let groupingmessage = '';
      groupings[i].forEach((id) => {
        groupingmessage = groupingmessage + ` <@${id}>\n`
      })

      embed.addFields({ name: `Group ${i+1}`, value: groupingmessage, inline: true})
    }

    await channel.send({embeds: [embed]});
    await interaction.editReply({content: 'Grouping successfully created.', ephemeral: true});
  },
};
