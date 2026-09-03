const mqtt = require('mqtt')
var mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883')

topic = "aashish/student"

function publishMessage(topic, message){
    console.log(`Publishing message to topic ${topic}: ${message}`);
    mqttClient.publish(topic, message)
}

function onConnect(){
    console.log("Connected to MQTT broker");
    publishMessage(topic, 'Hello from MQTT publisher: Aashish pub.js')
}

mqttClient.on('connect', onConnect)

/*
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function onConnect(){
    console.log("Connected to MQTT broker");
    publishMessage('aashish/student', 'Hello from MQTT publisher')
}

function publishMessage(topic, message){
    console.log(`Publishing message to topic ${topic}: ${message}`);
    mqttClient.publish(topic, message)
}

mqttClient.on('connect', onConnect)*/
