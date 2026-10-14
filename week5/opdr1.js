const { app } = require("@azure/functions");
const mqtt = require('mqtt')
var topic = "aashish/practicum5"
var mqttClient = null
var MQTT_URL = "mqtt://broker.hivemq.com:1883";

app.http("MQTTsend", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try{
      mqttClient = await mqtt.connectAsync(MQTT_URL, { connectTimeout: 5000 });
      const body = await request.json();
      await publishMessage(topic, body.message);
      await mqttClient.endAsync();
      return { status: 200};
   } catch (error) {
      return { status: 400, jsonBody:  error.message};
   }

  },
});

async function publishMessage(topic, message){
    console.log(`Publishing message to topic ${topic}: ${message}`);
    await mqttClient.publishAsync(topic, message);
}



