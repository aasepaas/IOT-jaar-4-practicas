const { app } = require("@azure/functions");
const Client = require('azure-iothub').Client;
const mqtt = require('mqtt');


require('dotenv').config();

const connectionString = process.env.IOTHUB_SERVICE_CONNECTION_STRING;
const MQTT_URL = "mqtt://broker.hivemq.com:1883";


const alarmlichten = {
    "1": { type: "mqtt",   topic: "aashish/alarmlicht" },
    "2": { type: "iothub", deviceId: process.env.IOTHUB_DEVICE_ID_Alarmlicht }
};

let client = null; 
alarmlichtDirectMethodName =  'setAlarm'

function invokeMethod(deviceId, methodName, payload) {
    const methodParams = {
        methodName: methodName,
        payload: payload || null,
        responseTimeoutInSeconds: 15
    };
    return new Promise((resolve, reject) => {
        client.invokeDeviceMethod(deviceId, methodParams, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function stuurViaMqtt(topic, bericht) {
    const mqttClient = await mqtt.connectAsync(MQTT_URL, { connectTimeout: 5000 });
    try {
        await mqttClient.publishAsync(topic, JSON.stringify(bericht));
    } finally {
        await mqttClient.endAsync();
    }
}

async function stuurViaIotHub(deviceId, bericht) {
    if (!client) {
        client = Client.fromConnectionString(connectionString);
    }
    return await invokeMethod(deviceId, alarmlichtDirectMethodName, bericht);
}

app.http('alarmlichten', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'alarmlicht/{id}',
    handler: async (request, context) => {
        const id = request.params.id;
        const alarmlicht = alarmlichten[id];
        if (!alarmlicht) {
            return { status: 404, jsonBody: { fout: `Alarmlicht met id ${id} bestaat niet` } };
        }
        const body = await request.json();
        try {
            if (alarmlicht.type === "mqtt") {
                await stuurViaMqtt(alarmlicht.topic, body);
                context.log(`Alarmlicht ${id} via MQTT (${alarmlicht.topic}):`, body);
                return { status: 200, jsonBody: { id, via: "mqtt", verstuurd: body } };
            } else {
                const antwoord = await stuurViaIotHub(alarmlicht.deviceId, body);
                context.log(`Alarmlicht ${id} via IoT Hub (${alarmlicht.deviceId}):`, antwoord);
                return { status: antwoord.status, jsonBody: { id, via: "iothub", antwoordDevice: antwoord.payload } };
            }
        } catch (err) {
            context.error(err);
            return { status: 502, jsonBody: { fout: `Alarmlicht ${id} kon niet worden aangestuurd`, detail: err.message } };
        }
    }
});