const { app } = require("@azure/functions");
const mqtt = require("mqtt");

const MQTT_URL = "mqtt://broker.hivemq.com:18833";
const topicAlarmlicht = "aashish/alarmlicht";
const geldigeIDs = [1, 2, 10];


app.http("MQTTsendAlarmlicht", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "alarmlicht",
  handler: async (request, context) => {
    let body = await request.json();
    context.log(body);

    if (body.type !== "alarmlicht" || !(geldigeIDs.includes(body.id))) {
      return { status: 404, jsonBody: { error: `Alarmlicht met id ${body.id} bestaat niet` } };
    }

    try {
      await publishMessage(topicAlarmlicht, JSON.stringify(body));
      return { status: 200, jsonBody: { verstuurd: body } };
    } catch (error) {
      context.error(error);
      return { status: 502, jsonBody: error.message };
    }
  },
});

async function publishMessage(topic, message) {
  const client = await mqtt.connectAsync(MQTT_URL, { connectTimeout: 5000 });
  try {
    console.log(`Publishing message to topic ${topic}: ${message}`);
    await client.publishAsync(topic, message);
  } finally {
    await client.endAsync();
  }
}