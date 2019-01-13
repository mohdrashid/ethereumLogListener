const config = require('./config.json');
const Web3 = require("web3");
//process.env.mongoURL = "mongodb://xxx:port/db";

const db = require('./DB');
const Log = require('./DB/models/Log');


async function start(callback) {
    if (global.connected !== true) {
        console.log('DB Not connected');
        return setTimeout(() => {
            start(callback)
        }, 10000);
    } else {
        console.log('DB Connected')
    }
    let web3;
    try {
        web3 = new Web3(
            new Web3.providers.WebsocketProvider(config.wsAddress)
        );
    } catch (err) {
        console.log(err);
        return setTimeout(() => {
            start(callback)
        }, 5000);
    }

    let subscription = web3.eth
        .subscribe("logs", { fromBlock: 23 }, function (err, res) {
            if (err) {
                console.log(err);
                try {
                    subscription.unsubscribe(function (error, success) {
                        if (success) {
                            console.log('Successfully unsubscribed!');
                        }
                        setTimeout(() => {
                            start(callback)
                        }, 10000);
                    });
                } catch (err) {
                    setTimeout(() => {
                        start(callback)
                    }, 10000);
                }
            } else {
                console.log("Started listening")
            }
        })
        .on("data", async function (transaction) {
            const topic = transaction.topics[0]
            let logStruct = await Log.findOne({
                topic: topic
            }).lean();
            if (logStruct === null || logStruct === undefined) {
                return;
            }
            let data = {};
            let extractedData = web3.eth.abi.decodeLog(logStruct.inputs, transaction.data);
            try {
                for (let key in extractedData) {
                    const keyToNum = parseInt(key);
                    if (isNaN(keyToNum) && key !== '__length__') {
                        data[key] = extractedData[key];
                    }
                }
                for (let i = 0; i < logStruct.indexedInputs.length; i++) {
                    let field = logStruct.indexedInputs[i];
                    data[field.name] = transaction.topics[i + 1];
                }
            } catch (err) {
                console.log(err);
            }
            const payload = {
                eventData: data,
                metaData: {
                    blockNumber: transaction.blockNumber,
                    tranxHash: transaction.transactionHash
                }
            }
            callback(payload);
        }).on("error", function (err) {
            logger.error(err);
            subscription.unsubscribe(function (error, success) {
                if (success) {
                    console.log('Successfully unsubscribed!');
                }
                setTimeout(() => {
                    start(callback)
                }, 10000);
            });
        })
}

start(function (data) {
    console.log(data)
});