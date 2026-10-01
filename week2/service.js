
const mqtt = require('mqtt')
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883')

const sensorTopic = 'gebouw/1/werkkamer/bewegingssensor/+'
const lampTopic = 'gebouw/1/werkkamer/lamp/lamp1'

const lampInterval = 5000

let offTimer = null

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
    handleSensorMessage(message)

}


function sendToLamp(status, brightness) {
    const message = {
        type: "bewegingssensor",
        status: status,
        brightness: brightness
    }
    mqttClient.publish(
        lampTopic,
        JSON.stringify(message)
    )
    console.log(
        `Lamp bericht: ${JSON.stringify(message)}`
    )
}

function handleSensorMessage(message) {
    try {
        const JSONmsg = JSON.parse(message.toString())
        if (JSONmsg.type !== "bewegingssensor") {
            console.log("Onbekend berichttype")
            return
        }
        if (JSONmsg.status !== true) {
            console.log("Beweging gestopt")
            sendToLamp(false, 0)
            return
        }
        console.log(
            `Beweging gedetecteerd: ${JSONmsg.brightness}%`
        )

        if (offTimer !== null) {
            clearTimeout(offTimer)
        }
        sendToLamp(
            true,
            JSONmsg.brightness
        )
        offTimer = setTimeout(() => {
            console.log(
                `${lampInterval / 1000} seconden voorbij`
            )
            console.log("Lamp wordt uitgezet")
            sendToLamp(false, 0)
            offTimer = null
        }, lampInterval)

    }
    catch (error) {
        console.log(
            "Ongeldig JSON bericht:",
            error.message
        )
    }
}

mqttClient.on('connect', onConnect)
mqttClient.on('message', onMessageReceived);

function subscribeToTopic(topic){
    mqttClient.subscribe(topic)
    console.log(`Subscribed to topic: ${topic}`);
}

main()

async function main(){
    await waitForConnection();
    subscribeToTopic(sensorTopic);
}