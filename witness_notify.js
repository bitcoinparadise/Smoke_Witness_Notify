// import required libraries.
var fs = require("fs");
const steem = require('smoke-js')
const discord = require('discord.io')
const moment = require('moment')
var rpc_node = null;
let missedCount = -1;

// Load the settings from the config file
loadConfig();

// Connect to the specified RPC node
rpc_node = config.rpc_nodes ? config.rpc_nodes[0] : (config.rpc_node ? config.rpc_node : 'https://rpc.smoke.io');

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
        message: moment().utc().format("YYYY-MM-DD HH:mm:ss") + " : Witness Monitor Bot Starting....."
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
                        message: moment().utc().format("YYYY-MM-DD HH:mm:ss") +  " : " + "`@" + config.accountname + "`" + " __Initial Missed Block Count__ = " + "**" + missedCount
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
                                message: moment().utc().format("YYYY-MM-DD HH:mm:ss") +  " : ⚠⚠⚠ __**Witness Missed a block**__ ⚠⚠⚠"
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

function loadConfig() {
  config = JSON.parse(fs.readFileSync("config.json"));
}

function failover() {
  if(config.rpc_nodes && config.rpc_nodes.length > 1) {
    // Give it a minute after the failover to account for more errors coming in from the original node
    setTimeout(function() { error_count = 0; }, 60 * 1000);

    var cur_node_index = config.rpc_nodes.indexOf(rpc_node) + 1;

    if(cur_node_index == config.rpc_nodes.length)
      cur_node_index = 0;

    rpc_node = config.rpc_nodes[cur_node_index];

    client = new dsteem.Client(rpc_node);
    utils.log('');
    utils.log('***********************************************');
    utils.log('Failing over to: ' + rpc_node);
    utils.log('***********************************************');
    utils.log('');
  }
}

//beta testing node fail-over feature
var error_count = 0;
function logError(message) {
  // Don't count assert exceptions for node failover
  if (message.indexOf('assert_exception') < 0 && message.indexOf('ERR_ASSERTION') < 0)
    error_count++;

  utils.log('Error Count: ' + error_count + ', Current node: ' + rpc_node);
  utils.log(message);
}

// Check if 10+ errors have happened in a 3-minute period and fail over to next rpc node
function checkErrors() {
  if(error_count >= 10)
    failover();

  // Reset the error counter
  error_count = 0;
}
setInterval(checkErrors, 3 * 60 * 1000);

start();
