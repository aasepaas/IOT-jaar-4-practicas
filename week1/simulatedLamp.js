const mqtt = require('mqtt')
var mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883')
const mqttTopic = 'aashish/student'

var lampOffTimer = null

function onConnect(){
    console.log("Connected to MQTT broker");
}

function waitForConnection(){
    return new Promise((resolve, reject) => {
        mqttClient.once('connect', () => {
            onConnect();
            resolve();
        });
    });
}

function subscribeToTopic(topic){
    mqttClient.subscribe(topic)
    console.log(`Subscribed to topic: ${topic}`);
}

function onMessageReceived(topic,message){
    console.log(`Received message from topic ${topic}: ${message.toString()}`);
    parseMessage(message);
}

function parseMessage(message) {
    try {
        const JSONmsg = JSON.parse(message.toString())
        if (JSONmsg.type === "bewegingssensor") {
            if (JSONmsg.status === true) {
                turnOn(JSONmsg.brightness)
            }
            else {
                turnOff()
            }
        }
        else{
            console.log("Onbekend message:", JSONmsg.type)
        }
    } catch (error) {
        console.log("Ongeldig JSON bericht:", error.message)
    }
}

function turnOn(brightness) {
    //timer off if new bewgeging detected
    if (lampOffTimer !== null) {
        clearTimeout(lampOffTimer)
    }
    console.log(`Lamp aan met lichtsterkte: ${brightness}%`)
    //turn timer on for 5 sec to turn off lamp
    lampOffTimer = setTimeout(() => {
        console.log("5 seconden voorbij, lamp gaat uit")
        turnOff()
    },5000);
}


// function turnOn(brightness) {
//     console.log(`Lamp aan met lichtsterkte: ${brightness}%`)
// }

function turnOff() {
    console.log("Lamp uit")
    turnOffTimer = null
}

mqttClient.on('message', onMessageReceived);


main()

async function main(){
    await waitForConnection();
    subscribeToTopic(mqttTopic);
}


/*function turnOn(brightness) {
    //timer off if new bewgeging detected
    if (lampOffTimer !== null) {
        clearTimeout(lampOffTimer)
    }
    console.log(`Lamp aan met lichtsterkte: ${brightness}%`)
    //turn timer on for 5 sec to turn off lamp
    lampOffTimer = setTimeout(() => {
        console.log("5 seconden voorbij, lamp gaat uit")
        turnOff()
    },5000);
}*/
