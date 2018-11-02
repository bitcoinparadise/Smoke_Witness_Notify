// import required libraries.
var fs = require("fs");
var steem = require('smoke-js');
var discord = require('discord.io');
var moment = require('moment');
var config = require('./config.json');
let missedCount = -1;

// Load the settings from the config file
function startup() {
loadConfig();
}

// Connect to the specified RPC node (Default: https://rpc.smoke.io)
rpc_node = config.rpc_nodes ? config.rpc_nodes[0] : (config.rpc_node ? config.rpc_node : 'https://rpc.smoke.io');
steem.api.setOptions({ url: rpc_node});

// used for re-trying failed promises
function delay(t) {
    return new Promise((r_resolve) => {
        setTimeout(r_resolve, t);
    });
}

// Attempts = how many times to allow an RPC problem before giving up
// Delay = how long before a retry
var retry_conf = {
    feed_attempts: 10,
    feed_delay: 60,
    login_attempts: 6,
    login_delay: 10
}

// create a new bot instance
let bot = new discord.Client({
    token: config.token,
    autorun: true
});

// ready callback is fired once the bot is connected.
bot.on('ready', function() {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);

    // send a message to a user id when you are ready
    bot.sendMessage({
        to: config.discorduser,
        message: moment().utc().format("YYYY-MM-DD HH:mm:ss") + " : Witness Notify Bot Starting....."
    });

});

// handle a disconnect from discord by attempting to reconnect
bot.on('disconnect', function(erMsg, code) {

    console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
    bot.connect();
});

/**
 *
 *  Main program loop
 *
 */

let start = async() => {
    try {

        // wait 10 seconds before you start for the bot to connect
        await timeout(10)


        while(true) {

            // if the blockcount is -1, we are initialising
            if (missedCount == -1)
            {
                console.log("Initialising current blockcount....");
                               // go and get witness information
               try {
                    let witness = await steem.api.getWitnessByAccountAsync(config.accountname);
                    missedCount = witness.total_missed;
                    bot.sendMessage({
                        to: config.discorduser,
                        message: moment().utc().format("YYYY-MM-DD HH:mm:ss") +  " : " + "`@" + config.accountname + "`" + " __Initial Missed Block Count__ = " + "**" + missedCount + "**"
                    });
                    console.log("Initial Missed Block count = " + missedCount)

                    }
                catch (e){
                    console.log("Error in getWitnessByAccount " + e)
                    bot.sendMessage({
                        to: config.discorduser,
                        message: moment().utc().format("YYYY-MM-DD HH:mm:ss") +  " : " + "`@" + config.accountname + "`" + " __Error in getWitnessByAccount__ " + "`" + e + "`"
                    });
                }



            }
            else {
                // check the  missedCount against the current live missed count

                try {
                    let witness = await steem.api.getWitnessByAccountAsync(config.accountname);

                    if (witness.total_missed > missedCount)
                    {
                        // we have missed a block!!!
                        console.log("Witness has missed a block");
                        bot.sendMessage({
                                to: config.discorduser,
                                message: moment().utc().format("YYYY-MM-DD HH:mm:ss") +  " : ⚠⚠⚠ __**`@" + config.accountname + "`" + " Witness Missed a block**__ ⚠⚠⚠"
                            });

                        missedCount = witness.total_missed;
                    }
                }
                catch (e)
                {
                    console.log("Error in getWitnessByAccount " + e)
                    bot.sendMessage({
                        to: config.discorduser,
                        message: moment().utc().format("YYYY-MM-DD HH:mm:ss") +  " : " + "`@" + config.accountname + "`" + " __Error in getWitnessByAccount__ " + "`" + e + "`"
                    });
                }
            }

            // wait 60 seconds for next check
            await timeout(60)
        }
    } catch (e) {
        console.error('start', e)
        release();
        start()
    }
}

// a helper function to to a wait
let timeout = (sec) => {
    return new Promise(resolve => setTimeout(resolve, sec * 1000))
}

start();
