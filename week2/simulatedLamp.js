const mqtt = require('mqtt')
var mqttClient = mqtt.connect('mqtts://34d4c8f868cc4ee08380a7cf68700146.s1.eu.hivemq.cloud:8883',
    {username: 'lamp1',
    password: 'password'}
) 
var mqttClient =  mqtt.connect('mqtt://broker.hivemq.com:1883')
const mqttTopic = 'gebouw/1/werkkamer/lamp/lamp1' 
// 'gebouw/1/werkkamer/lamp/lamp1'  'aashish/student/lampBesturing/#'
//const mqttTopicBeheerder = 'aashish/student/lamp/beheerder'

var lampOffTimer = null
var maxBrightness = null
var lampOffTimerBeheerder = null
var lampOffTimerMilliSec = 5000

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
    if (topic === 'aashish/student/lampBesturing/beheerder') {
        parseMessageFromBeheerder(message);
    }else /*if (topic === 'aashish/student/lampBesturing/bewegingssensor')*/ {
        parseMessage(message);
    }
}

function parseMessageFromBeheerder(message){
    try{
        const JSONmsg = JSON.parse(message.toString())
        if (JSONmsg.maxBrightness) {
            maxBrightness = JSONmsg.maxBrightness;
            console.log(`Maximale lichtsterkte is ingesteld op: ${maxBrightness}%`)
        } 
        if (JSONmsg.offTimer) {
            lampOffTimerBeheerder = JSONmsg.offTimer * 1000;
            console.log(`off timer is aangepast naar ${lampOffTimerBeheerder}`)
        }
    }catch (error) {
        console.log("Ongeldig JSON bericht:", error.message)
    }
}

function parseMessage(message) {
    try {
        const JSONmsg = JSON.parse(message.toString())
        if (JSONmsg.type === "bewegingssensor") {
            if (JSONmsg.status === true) {
                console.log("true")
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
    
    if (lampOffTimerBeheerder !== null) {
        lampOffTimerMilliSec = lampOffTimerBeheerder;
    }
    if (lampOffTimer !== null) {
        clearTimeout(lampOffTimer)
    }
    if (maxBrightness != null && brightness > maxBrightness) {
        console.log(`Maximale lichtsterkte is ingesteld op: ${maxBrightness}%, lamp gaat aan met ${maxBrightness}%`)
        brightness = maxBrightness
    }
    console.log(`Lamp aan met lichtsterkte: ${brightness}%`)
    //turn timer on for 5 sec to turn off lamp
    // lampOffTimer = setTimeout(() => {
    //     console.log(`${lampOffTimerMilliSec/1000} seconden voorbij, lamp gaat uit`)
    //     turnOff()
    // },lampOffTimerMilliSec);
}

function turnOff() {
    console.log("Lamp uit")
    lampOffTimer  = null
}

mqttClient.on('message', onMessageReceived);


main()

async function main(){
    await waitForConnection();
    subscribeToTopic(mqttTopic);
}
