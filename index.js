const Discord = require("discord.js");
const YTDL = require ("ytdl-core");

const PREFIX = "sun";
const TOKEN = "no"

function generateHex() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function play(connection, message) {
	var server = servers[message.guild.id];

	server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

	server.queue.shift();

	server.dispatcher.on("end"), function() {
		if (server.queue[0]) play(connection, message);
		else connection.disconnect();
	};
}

var fortunes = [
    "Yes",
    "No",
    "Maybe",
	"fucc u"
];

var bot = new Discord.Client();

var servers = {};


bot.on("ready", function() {
    console.log("Ready to play in different servers!");
    bot.user.setGame("sunhelp | SunnyBot");
    bot.user.setStatus("online")
});

bot.on("guildMemberAdd", function(member) {
    member.guild.channels.find("name", "general").send(member.toString() + " Welcome to this server!");

    member.addRole(member.guild.roles.find("name", "Members"));

    member.guild.createRole({
        name: member.user.username,
		color: generateHex(),
        permissions: []
    }).then(function(role) {
        member.addRole(role);
    });
})

bot.on("message", function(message) {
    if (message.author.equals(bot.user)) return;


    if (message.content == "hello") {
        message.channel.send("Hello! :smiley:");
    }

    if (!message.content.startsWith(PREFIX)) return;

    var args = message.content.substring(PREFIX.length).split(" ");

    switch (args[0].toLowerCase()) {
            case "ping":
                message.channel.send("Pong!");
                break;
            case "8ball":
                if (args[1]) {
                    message.channel.send(fortunes[Math.floor(Math.random() * fortunes.length)]);
                } else {
                    message.channel.send("I can't read that!");
                }
                break;
            case "myname":
                var embed = new Discord.RichEmbed()
                    .setAuthor(message.author.username)
                    .setDescription("This is your username")

                message.channel.sendMessage(embed);
                break;
            case "myavatar":
                var embed = new Discord.RichEmbed()
                    .setImage(message.author.avatarURL)
                    .setDescription("This is your avatar")

                message.channel.sendMessage(embed);
                break;
            case "myid":
                var embed = new Discord.RichEmbed()
                    .setAuthor(message.author.id)
                    .setDescription("This is your ID")

                message.channel.sendMessage(embed);
                break;
            case "help":
                var embed = new Discord.RichEmbed()
				    .addField("Welcome to SunnyBot help page!", "You can find here my commands and functions.")
					.addField("Bot version", "1.0.0", true)
                    .addField("General commands:", "ping, info, 8ball, help, noticeme")
                    .addField("User commands:", "myname, myavatar, myid")
                    .addField("Staff commands:", "removerole, deleterole")
					.addField("What is new?", "SunnyBot is now available for all Discord users!", true) 
                    .setColor(0x3498db)
                    .setFooter("Thank you for using SunnyBot! 👍");

                message.author.sendMessage(embed);
                break;
			case "noticeme":
                message.channel.send(message.author.toString() + ", You have been noticed!");
                break;
            case "removerole":
                message.member.removeRole(member.guild.roles.find("name", "Members"));
                break;
            case "deleterole":
                message.guild.roles.find("name", "Members").delete();
                break;
			case "play":
			    if (!args[1]) {
					message.channel.sendMessage("Please provide a link")
					return;
				}

				if (!message.member.voiceChannel) {
					message.channel.sendMessage("You aren't in a voice channel")
					return;
				}

				if(!servers[message.guild.id]) servers[message.guild.id] = {
					queue: []
				}

				var server = servers[message.guild.id];

				if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
					play(connection, message);
				});
			    break;
			case "skip":
			    var server = servers[message.guild.id];

				if (server.dispatcher) server.dispatcher.end();
				break;
			case "stop":
			    var server = servers[message.guild.id];

				if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
				break;
            default:
                message.channel.send("Invalid command!");
    }
});

bot.login(TOKEN);
