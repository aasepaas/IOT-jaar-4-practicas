const mqtt = require('mqtt')
var mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883')
const mqttTopic = 'aashish/student'

function onConnect(){
    console.log("Connected to MQTT broker");
    onSubscribe(mqttTopic)
}

function onSubscribe(topic){
    mqttClient.subscribe(topic)
    console.log(`Subscribed to topic: ${topic}`);
}

function onMessageReceived(topic,message){
    console.log(`Received message from topic ${topic}: ${message.toString()}`);
}

mqttClient.on('connect', onConnect)
mqttClient.on('message', onMessageReceived);
