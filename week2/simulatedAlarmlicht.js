const mqtt = require('mqtt')
const chalk = require('chalk')

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883')

const mqttTopic = 'aashish/alarmlicht'

let alarmTimer = null
let alarmAan = false
let alarmStatus = false

let interval = 1000

let color = {
    r: 0,
    g: 255,
    b: 0
}

function waitForConnection(){
    return new Promise((resolve, reject) => {
        mqttClient.once('connect', () => {
            onConnect();
            resolve();
        });
    });
}

function onConnect() {
    console.log("Service connected to MQTT broker")
}

function onMessageReceived(topic,message){
    console.log(`Received message from topic ${topic}: ${message.toString()}`);
    parseMessage(message)

}

function subscribeToTopic(topic){
    mqttClient.subscribe(topic)
    console.log(`Subscribed to topic: ${topic}`);
}

function onConnect() {
    console.log("Connected to MQTT broker")
    //mqttClient.subscribe(mqttTopic)
    //console.log(`Subscribed to topic: ${mqttTopic}`)
}

function printAlarm() {
    process.stdout.cursorTo(0)
    if (alarmAan) {
        process.stdout.write("                 ")
        alarmAan = false
    }
    else {
        process.stdout.write(
            chalk.rgb(color.r, color.g, color.b)("ALARM AAN")
        )
        alarmAan = true
    }
}

function startAlarm() {
    stopAlarm()
    alarmStatus = true
    console.log(
        `Alarmlicht gestart: interval=${interval}ms RGB=(${color.r},${color.g},${color.b})`
    )
    printAlarm()
    alarmTimer = setInterval(() => {
        printAlarm()
    }, interval)
}

function stopAlarm() {
    alarmStatus = false
    if (alarmTimer !== null) {
        clearInterval(alarmTimer)
        alarmTimer = null
    }
    process.stdout.cursorTo(0)
    process.stdout.write("                 ")
    alarmAan = false
    console.log("\nAlarmlicht uit")
}

function validateMessage(msg) {
    if (typeof msg !== "object" || msg === null) {
        return false
    }
    if (msg.type !== "alarmlicht") {
        return false
    }
    if (typeof msg.status !== "boolean") {
        return false
    }
    if (typeof msg.interval !== "number" ||
        msg.interval <= 0) {
        return false
    }
    if (!msg.color ||
        typeof msg.color.r !== "number" ||
        typeof msg.color.g !== "number" ||
        typeof msg.color.b !== "number") {
        return false
    }
    if (
        msg.color.r < 0 || msg.color.r > 255 ||
        msg.color.g < 0 || msg.color.g > 255 ||
        msg.color.b < 0 || msg.color.b > 255
    ) {
        return false
    }
    return true
}

function parseMessage(message) {
    try {
        const JSONmsg = JSON.parse(message.toString())
        if (!validateMessage(JSONmsg)) {
            console.log("Ongeldig alarmlicht bericht")
            return
        }
        interval = JSONmsg.interval
        color = JSONmsg.color
        if (JSONmsg.status === true) {
            startAlarm()
        }
        else {
            stopAlarm()
        }
    }
    catch (error) {
        console.log(
            "Ongeldig JSON bericht:",
            error.message
        )
    }
}

//mqttClient.on('connect', onConnect)
mqttClient.on('message', onMessageReceived)

main()

async function main(){
    await waitForConnection();
    subscribeToTopic(mqttTopic);
}
