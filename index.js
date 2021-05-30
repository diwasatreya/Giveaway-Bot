const { keep_alive } = require("./keep_alive");
// Load settings file.

const settings = require("./settings.json");
const ms = require("ms");

msggiveaways = [];
msgdatabase = [];

// Startup the Discord bot.
const Discord = require("discord.js");
const client = new Discord.Client({
    presence: { activity: { name: settings.status.name, type: settings.status.type }, status: settings.status.status },
    messageCacheLifetime: 300,
    messageSweepInterval: 600,
});

client.login(process.env.TOKEN);

// Discord Bot Events

client.on('ready', () => {
    console.log('Bot is ready!');
});


client.on('message', async message => {
	if (message.author.bot) return;
    if (message.channel.type == "dm") return;
    if (msggiveaways.length !== 0) {
        for (var i = 0, len = msggiveaways.length; i < len; i++) {
            if (msggiveaways[i].id == message.guild.id) {
                let test = msgdatabase[i].filter(u => u.id == message.author.id);
                if (test.length !== 0) {
                    msgdatabase[i] = msgdatabase[i].filter(u => u.id !== message.author.id);
                    msgdatabase[i].push({id: message.author.id, count: test[0].count + 1})
                } else {
                    msgdatabase[i].push({id: message.author.id, count: 1})
                }
            }
        }
    }
    if (!message.member.hasPermission('MANAGE_GUILD')) return;
    if (!message.content.startsWith(settings.bot.prefix)) return;
    let args = message.content.slice(settings.bot.prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();
    try {
        if (cmd == "gstart") {
            if (args[0]) {
                if (args[5]) {
                    let time = (typeof ms(args[0]) == "number" ? ms(args[0]) : (isNaN(parseFloat(args[0])) ? undefined : parseFloat(args[0]) * 1000));
                    let winners = parseFloat(args[1]);
                    let serverid = args[2];
                    let rolevar = args[3];
                    let messagecountvar = args[4];
                    let testargs = args;
                    testargs.shift();
                    testargs.shift();
                    testargs.shift();
                    testargs.shift();
                    testargs.shift();
                    let prize = testargs.join(" ").split(" | ");
                    if (!time) {
                        message.channel.send(
                            new Discord.MessageEmbed()
                                .setTitle('Giveaway')
                                .setColor("RANDOM")
                                .setDescription(`The **first** argument must be a number.`)
                        );
                    } else {
                        if (time < 5000 || time > 2678400000) {
                            message.channel.send(
                                new Discord.MessageEmbed()
                                    .setTitle('Giveaway')
                                    .setColor("RANDOM")
                                    .setDescription(`The **first** argument cannot be less than 5 seconds or greater than 31 days.`)
                            );
                        } else {
                            if (isNaN(winners)) {
                                message.channel.send(
                                    new Discord.MessageEmbed()
                                        .setTitle('Giveaway')
                                        .setColor("RANDOM")
                                        .setDescription(`The **second** argument must be a number.`)
                                );
                            } else {
                                if (winners < 1 || winners > 10) {
                                    message.channel.send(
                                        new Discord.MessageEmbed()
                                            .setTitle('Giveaway')
                                            .setColor("RANDOM")
                                            .setDescription(`The **second** argument cannot be less than 1 or greater than 10 winners.`)
                                    );
                                } else {
                                    requirements = [];
                                    if (serverid !== "none") {
                                        let server = await client.guilds.cache.get(serverid);
                                        if (!server) {
                                            message.channel.send(
                                                new Discord.MessageEmbed()
                                                    .setTitle('Giveaway')
                                                    .setColor("RANDOM")
                                                    .setDescription(`Could not get the server id on the **third** argument.`)
                                            );
                                            return;
                                        } else {
                                            let invite = await (server.channels.cache.filter(c => c.type === 'text').find(x => x.position == 0)).createInvite(
                                                {
                                                  maxAge: time
                                                },
                                                `Giveaway command ran by: ${message.author.tag}`
                                            )
                                            requirements.push(`Join Server: [${server.name}](${invite}) (${server.id})`);
                                        };
                                    };
                                    if (rolevar !== "none") {
                                        let role = message.guild.roles.cache.get(rolevar);
                                        if (!role) {
                                            message.channel.send(
                                                new Discord.MessageEmbed()
                                                    .setTitle('Giveaway')
                                                    .setColor("RANDOM")
                                                    .setDescription(`Could not get the role id on the **fourth** argument.`)
                                            );
                                            return;
                                        } else {
                                            requirements.push(`Must have role: <@&${role.id}> (${role.id})`);
                                        }
                                    };
                                    if (messagecountvar !== "none") {
                                        let messagecount = parseFloat(messagecountvar);
                                        if (isNaN(messagecount)) {
                                            message.channel.send(
                                                new Discord.MessageEmbed()
                                                    .setTitle('Giveaway')
                                                    .setColor("RANDOM")
                                                    .setDescription(`The **fifth** argument must be a number or "none".`)
                                            );
                                            return;
                                        } else {
                                            if (messagecount < 1 || messagecount > 1000) {
                                                message.channel.send(
                                                    new Discord.MessageEmbed()
                                                        .setTitle('Giveaway')
                                                        .setColor("RANDOM")
                                                        .setDescription(`The **fifth** argument cannot be less than 1 or greater than 1000 messages.`)
                                                );
                                                return;
                                            } else {
                                                msgcounttest = msggiveaways.length; // don't do +1 because it's .length
                                                msgdatabase.push([]);
                                                msggiveaways.push({id:message.guild.id,count:messagecount});
                                                requirements.push(`Send ${messagecount} new messages.`);
                                            };
                                        };
                                    } else {
                                        msgcounttest = null;
                                    };
                                    let thing = msgcounttest;
                                    message.delete();
                                    let embed = new Discord.MessageEmbed()
                                        .setTitle('Giveaway! ' + prize[0])
                                        .setColor("YELLOW")
                                        .setDescription(`React 🎉 to join the giveaway.`)
                                        .addField("Winners", "There will be **" + winners + "** winners.")
                                        .addField("Requirements", (await requirements).length == 0 ? "None!" : requirements.join("\n") + (!prize[1] ? "" : "\n" + prize.join(" | ").slice(prize[0].length + 3)))
                                        .setFooter("Ends after " + ms(time, {long:true}))
                                    message.channel.send(embed).then(msg => {
                                        msg.react("🎉");
                                        let filter = async (reaction, user) => {
                                            if (user.id !== client.user.id) {
                                                if (reaction.emoji.name == "🎉") {
                                                    let userreacts = msg.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
                                                    if (serverid !== "none") {
                                                        let server = await client.guilds.cache.get(serverid);
                                                        if (server) {
                                                            if (server.members.cache.filter(u => u.id == user.id).array().length == 0) {
                                                                for (let reaction of userreacts.values()) {
                                                                    await reaction.users.remove(user.id);
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (messagecountvar !== "none") {
                                                        let messagecount = parseFloat(messagecountvar);
                                                        if (msgdatabase[thing].length == 0) {
                                                            for (let reaction of userreacts.values()) {
                                                                await reaction.users.remove(user.id);
                                                            }
                                                        } else {
                                                            for (var i = 0, len = msgdatabase[thing].length; i < len; i++) {
                                                                if (msgdatabase[thing][i].id == message.author.id) {
                                                                    let test = msgdatabase[thing][i];
                                                                    if (test.id == user.id) {
                                                                        if (test.count < messagecount) {
                                                                            for (let reaction of userreacts.values()) {
                                                                                await reaction.users.remove(user.id);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (rolevar !== "none") {
                                                        let role = message.guild.roles.cache.get(rolevar);
                                                        if (role) {
                                                            if (!message.guild.members.cache.get(user.id).roles.cache.has(role.id)) {
                                                                for (let reaction of userreacts.values()) {
                                                                    await reaction.users.remove(user.id);
                                                                }
                                                            }
                                                        }
                                                    }
                                                };
                                            };
                                        };
                                        msg.awaitReactions(filter, { 
                                            max: null, 
                                            time: time 
                                        }).then(async collected => {
                                        }).catch(err => {});
                                        setTimeout(
                                            async function() {
                                                // Reroll breaks before of:
                                                /*
                                                if (typeof (await thing) == "number") {
                                                    delete msggiveaways[await thing];
                                                    msggiveaways = msggiveaways.filter(function (el) {
                                                        return el != null;
                                                    });
                                                    delete msgdatabase[await thing];
                                                    msgdatabase = msgdatabase.filter(function (el) {
                                                        return el != null;
                                                    });
                                                }
                                                */
                                                let msg2 = await message.channel.messages.fetch(msg.id);
                                                if (await msg2) {
                                                    if (msg2.embeds[0].description == "Giveaway is over.") return;
                                                    let react = await msg2.reactions.cache.get("🎉").users ? (await msg2.reactions.cache.get("🎉").users.fetch()).array().filter(user => user.id !== client.user.id) : [];
                                                    if (react.length == 0) {
                                                        await msg2.edit(
                                                            new Discord.MessageEmbed()
                                                                .setTitle('Giveaway! ' + prize[0])
                                                                .setDescription(`Giveaway is over.`)
                                                                .addField("Winners", "No winners.")
                                                                .addField("Requirements", (await requirements).length == 0 ? "None!" : requirements.join("\n"))
                                                                .setFooter("There could have been up to " + winners + " winners.")
                                                        )
                                                        message.channel.send(":tada: **The giveaway has ended.** Our winners are: No winners.")
                                                    } else {
                                                        let users = [];
                                                        for (var i = 0, len = winners; i < len; i++) {
                                                            let random = Math.floor(Math.random() * react.length);
                                                            if (react.length == 0) {
                                                                i == winners;
                                                            } else {
                                                                let id = react[random].id;
                                                                if (users.includes(id)) {
                                                                    i--
                                                                } else {
                                                                    let pass = true;
                                                                    if (!message.guild.members.cache.get(id)) pass = false;
                                                                    if (serverid !== "none") {
                                                                        let server = await client.guilds.cache.get(serverid);
                                                                        if (server) {
                                                                            if (server.members.cache.filter(u => u.id == id).array().length == 0) {
                                                                                pass = false;
                                                                            }
                                                                        }
                                                                    }
                                                                    if (messagecountvar !== "none") {
                                                                        let messagecount = parseFloat(messagecountvar);
                                                                        if (msgdatabase[thing].length == 0) {
                                                                            pass = false
                                                                        } else {
                                                                            for (var i = 0, len = msgdatabase[thing].length; i < len; i++) {
                                                                                if (msgdatabase[thing][i].id == id) {
                                                                                    let test = msgdatabase[thing][i];
                                                                                    if (test.id == id) {
                                                                                        if (test.count < messagecount) {
                                                                                            pass = false
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                    if (rolevar !== "none") {
                                                                        let role = message.guild.roles.cache.get(rolevar);
                                                                        if (role) {
                                                                            if (!message.guild.members.cache.get(id).roles.cache.has(role.id)) {
                                                                                pass = false
                                                                            }
                                                                        }
                                                                    }
                                                                    if (pass == true) {
                                                                        users.push("<@" + id + ">");
                                                                    } else {
                                                                        i--;
                                                                    }
                                                                    delete react[random];
                                                                    react = react.filter(function (el) {
                                                                        return el != null;
                                                                    });
                                                                }   
                                                            }
                                                        };
                                                        await msg2.edit(
                                                            new Discord.MessageEmbed()
                                                                .setTitle('Giveaway! ' + prize[0])
                                                                .setDescription(`Giveaway is over.`)
                                                                .addField("Winners", users.length !== 0 ? users.join("\n") : "No winners.")
                                                                .addField("Requirements", (await requirements).length == 0 ? "None!" : requirements.join("\n"))
                                                                .setFooter("There could have been up to " + winners + " winners.")
                                                        )
                                                        message.channel.send(":tada: **The giveaway has ended.** Our winners are:" + (users.length == 0 ? " No winners." : "\n- " + users.join("\n- ")))
                                                    }
                                                }
                                            }
                                        , time);
                                    }).catch(err => {
                                    });
                                };
                            };
                        };
                    };
                } else {
                    message.channel.send(
                        new Discord.MessageEmbed()
                            .setTitle('Giveaway')
                            .setColor("RED")
                            .setDescription(`Incorrect usage. Please use \`${settings.bot.prefix}gstart <time> <winners> <server id or "none"> <role id or "none"> <message count number or "none"> <prize>\` instead.`)
                    );
                };
            } else {
                message.channel.send(
                    new Discord.MessageEmbed()
                        .setTitle('Giveaway')
                        .setColor("RED")
                        .setDescription(`In order to use this command, you must run the command \`${settings.bot.prefix}gstart <time> <winners> <server id or "none"> <role id or "none"> <message count number or "none"> <prize>\`.`)
                );
            };
        } else if (cmd == "greroll") {
            if (args[0] && !args[1]) {
               message.channel.messages.fetch(args[0]).then(rerollmsg => {
                    reroll();
                    async function reroll() {
                        let invalidmsg = new Discord.MessageEmbed()
                            .setTitle('Reroll')
                            .setColor("GREEN")
                            .setDescription(`This provided message is not a giveaway message.`)
                        if (rerollmsg.author.id == client.user.id) {
                            if (rerollmsg.embeds.length !== 0) {
                                if (rerollmsg.embeds[0].title.startsWith("Giveaway!")) {
                                    if (rerollmsg.embeds[0].description == "Giveaway is over.") {
                                        let users = [];
                                        let react = await rerollmsg.reactions.cache.get("🎉").users ? (await rerollmsg.reactions.cache.get("🎉").users.fetch()).array().filter(user => user.id !== client.user.id) : [];
                                        let requirements = rerollmsg.embeds[0].fields[1].value == "None!" ? [] : rerollmsg.embeds[0].fields[1].value.split("\n");
                                        let winners = parseFloat(rerollmsg.embeds[0].footer.text.slice("There could have been up to ".length));
                                        for (var i = 0, len = winners; i < len; i++) {
                                            let random = Math.floor(Math.random() * react.length);
                                            if (react.length == 0) {
                                                i == winners;
                                            } else {
                                                let id = react[random].id;
                                                if (users.includes(id)) {
                                                    i--
                                                } else {
                                                    let pass = true;
                                                    if (!message.guild.members.cache.get(id)) pass = false;
                                                    let checkserver = requirements.filter(t => t.startsWith("Join"));
                                                    if (checkserver.length !== 0) {
                                                        let serverid = checkserver[0].slice(0, -1).slice(-18);
                                                        let server = await client.guilds.cache.get(serverid);
                                                        if (server) {
                                                            if (server.members.cache.filter(u => u.id == id).array().length == 0) {
                                                                pass = false;
                                                            }
                                                        }
                                                    }
                                                    /*
                                                    if (requirements.filter(t => t.startsWith("Send")).length !== 0) {
                                                        let messagecount = parseFloat(requirements.filter(t => t.startsWith("Send")).slice("Send".length));
                                                        if (msgdatabase[thing].length == 0) {
                                                            pass = false
                                                        } else {
                                                            for (var i = 0, len = msgdatabase[thing].length; i < len; i++) {
                                                                if (msgdatabase[thing][i].id == id) {
                                                                    let test = msgdatabase[thing][i];
                                                                    if (test.id == id) {
                                                                        if (test.count < messagecount) {
                                                                            pass = false
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    */
                                                    if (pass == true) {
                                                        users.push("<@" + id + ">");
                                                    } else {
                                                        i--;
                                                    }
                                                    delete react[random];
                                                    react = react.filter(function (el) {
                                                        return el != null;
                                                    });
                                                }   
                                            }
                                        };
                                        message.delete();
                                        await rerollmsg.edit(
                                            new Discord.MessageEmbed()
                                                .setTitle(rerollmsg.embeds[0].title)
                                                .setColor("GREEN")
                                                .setDescription(rerollmsg.embeds[0].description)
                                                .addField("Winners", users.length !== 0 ? users.join("\n") : "No winners.")
                                                .addField("Requirements", rerollmsg.embeds[0].fields[1].value)
                                                .setFooter(rerollmsg.embeds[0].footer.text)
                                        )
                                        message.channel.send(":tada: **The giveaway has ended.** Our winners are:" + (users.length == 0 ? " No winners." : "\n- " + users.join("\n- ")))
                                    } else {
                                        message.channel.send(
                                            new Discord.MessageEmbed()
                                                .setTitle('Reroll')
                                                .setColor("BLUE")
                                                .setDescription(`The giveaway has not ended yet.`)
                                        )
                                    }
                                } else {
                                    message.channel.send(invalidmsg);
                                }
                            } else {
                                message.channel.send(invalidmsg);
                            }
                        } else {
                            message.channel.send(
                                new Discord.MessageEmbed()
                                    .setTitle('Reroll')
                                    .setColor("RED")
                                    .setDescription(`Message author is not the bot.`)
                            );
                        }
                    }
                }).catch(err => {
                    message.channel.send(
                        new Discord.MessageEmbed()
                            .setTitle('Reroll')
                            .setColor("RED")
                            .setDescription(`Could not find the message.`)
                    );
                });
            } else {
                message.channel.send(
                    new Discord.MessageEmbed()
                        .setTitle('Reroll')
                        .setColor("RED")
                        .setDescription(`In order to use this command, you must run the command \`${settings.bot.prefix}reroll <message id>\`.\nMake sure the message is in this channel.\n\nAny message and role checks will not work on reroll.`)
                );
            }
        } else if (cmd == "gend") {
            if (args[0] && !args[1]) {
               message.channel.messages.fetch(args[0]).then(rerollmsg => {
                    reroll();
                    async function reroll() {
                        let invalidmsg = new Discord.MessageEmbed()
                            .setTitle('End Giveaway')
                            .setColor("RED")
                            .setDescription(`This provided message is not a giveaway message.`)
                        if (rerollmsg.author.id == client.user.id) {
                            if (rerollmsg.embeds.length !== 0) {
                                if (rerollmsg.embeds[0].title.startsWith("Giveaway!")) {
                                    if (rerollmsg.embeds[0].description !== "Giveaway is over.") {
                                        let users = [];
                                        let react = await rerollmsg.reactions.cache.get("🎉").users ? (await rerollmsg.reactions.cache.get("🎉").users.fetch()).array().filter(user => user.id !== client.user.id) : [];
                                        let requirements = rerollmsg.embeds[0].fields[1].value == "None!" ? [] : rerollmsg.embeds[0].fields[1].value.split("\n");
                                        let winners = parseFloat(rerollmsg.embeds[0].footer.text.slice("There could have been up to ".length));
                                        for (var i = 0, len = winners; i < len; i++) {
                                            let random = Math.floor(Math.random() * react.length);
                                            if (react.length == 0) {
                                                i == winners;
                                            } else {
                                                let id = react[random].id;
                                                if (users.includes(id)) {
                                                    i--
                                                } else {
                                                    let pass = true;
                                                    if (!message.guild.members.cache.get(id)) pass = false;
                                                    let checkserver = requirements.filter(t => t.startsWith("Join"));
                                                    if (checkserver.length !== 0) {
                                                        let serverid = checkserver[0].slice(0, -1).slice(-18);
                                                        let server = await client.guilds.cache.get(serverid);
                                                        if (server) {
                                                            if (server.members.cache.filter(u => u.id == id).array().length == 0) {
                                                                pass = false;
                                                            }
                                                        }
                                                    }
                                                    if (pass == true) {
                                                        users.push("<@" + id + ">");
                                                    } else {
                                                        i--;
                                                    }
                                                    delete react[random];
                                                    react = react.filter(function (el) {
                                                        return el != null;
                                                    });
                                                }   
                                            }
                                        };
                                        message.delete();
                                        await rerollmsg.edit(
                                            new Discord.MessageEmbed()
                                                .setTitle(rerollmsg.embeds[0].title)
                                                .setColor("GREEN")
                                                .setDescription("Giveaway is over.")
                                                .addField("Winners", users.length !== 0 ? users.join("\n") : "No winners.")
                                                .addField("Requirements", rerollmsg.embeds[0].fields[1].value)
                                                .setFooter(rerollmsg.embeds[0].footer.text)
                                        )
                                        message.channel.send(":tada: **The giveaway has ended.** Our winners are:" + (users.length == 0 ? " No winners." : "\n- " + users.join("\n- ")))
                                    } else {
                                        message.channel.send(
                                            new Discord.MessageEmbed()
                                                .setTitle('End Giveaway')
                                                .setColor("BLUE")
                                                .setDescription(`The giveaway already ended.`)
                                        )
                                    }
                                } else {
                                    message.channel.send(invalidmsg);
                                }
                            } else {
                                message.channel.send(invalidmsg);
                            }
                        } else {
                            message.channel.send(
                                new Discord.MessageEmbed()
                                    .setTitle('End Giveaway')
                                    .setColor("RED")
                                    .setDescription(`Message author is not the bot.`)
                            );
                        }
                    }
                }).catch(err => {
                    message.channel.send(
                        new Discord.MessageEmbed()
                            .setTitle('End Giveaway')
                            .setColor("RED")
                            .setDescription(`Could not find the message.`)
                    );
                });
            } else {
                message.channel.send(
                    new Discord.MessageEmbed()
                        .setTitle('End Giveaway')
                        .setColor("RED")
                        .setDescription(`In order to use this command, you must run the command \`${settings.bot.prefix}end <message id>\`.\nMake sure the message is in this channel.\n\nAny message and role checks will only work if the bot is given proper permissions.`)
                );
            }
        }
    } catch(err) {
        console.log(`An error has occured when using command ${cmd}:`);
        console.log(err);
    };
});
