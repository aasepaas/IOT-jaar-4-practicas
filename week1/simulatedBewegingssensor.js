const mqtt = require('mqtt')
var mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883')
const topicName = 'aashish/student'

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let offTimer = null;

function onConnect(){
    console.log("Connected to MQTT broker");
}

//function only continues when connection to mqtt broker is established
//blocking code to prevent pu/sub before connection
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

  if(input == "quit"){
    rl.close();
    process.exit(0);
  }else{
    console.log("Er is beweging geconstateerd");
    const message = {
        type: "bewegingssensor",
        status: true,
        brightness: null
    }
    if (input == "1"){
        message.brightness = 25
    }
    else if (input == "2"){
        message.brightness = 50
    }
    else if (input == "3"){
        message.brightness = 75
    }else if (input == "4"){
        message.brightness = 100
    }else{
        console.log("Invalid input");
        return;
    }
    publishMessage(topicName, JSON.stringify(message))
    //after 5 sec lamp uit 
    /*if (offTimer) {
        clearTimeout(offTimer);
    }
    message.status = false
    message.brightness = 0
    offTimer = setTimeout(() => {
        publishMessage(topicName, JSON.stringify(message))
    }, 5000);*/ 
  }
}

main()

async function main(){
    await waitForConnection();
    publishMessage(topicName, 'Hello from MQTT publisher')
    console.log("Press enter voor beweging of quit+enter om programma te stoppen")
    rl.on('line', onEnterPress);
}

