const mqtt = require('mqtt')
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883')
const topicName = 'aashish/student/lampBesturing/beheerder'

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function publishMessage(topic, message){
    console.log(`Publishing message to topic ${topic}: ${message}`);
    mqttClient.publish(topic, message)
}

function onEnterPress(input){
  console.log(`Received: ${input}`);
  const inputSplit = input.split(" ");
  var messageToLamp = {};

  if(input == "quit"){
    rl.close();
    process.exit(0);
  }else if (inputSplit[0] === "lamp"){
    console.log("Beheerder wilt iets sturen naar lamp");
    for (let i = 1; i < inputSplit.length; i++) {
        if (inputSplit[i] === "maxBrightness" || inputSplit[i] === "offTimer") {
            messageToLamp[inputSplit[i]] = inputSplit[i + 1];
            i++;
        }    
    }
    publishMessage(topicName, JSON.stringify(messageToLamp))   
  }else{
    console.log("ongeldige input")
  }
}

main()
async function main(){
    await waitForConnection();
    console.log("Welkom lamp beheerder")
    rl.on('line', onEnterPress);
}