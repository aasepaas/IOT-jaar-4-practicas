const { app } = require("@azure/functions");
const Client = require('azure-iothub').Client;

require('dotenv').config();

const connectionString = process.env.IOTHUB_SERVICE_CONNECTION_STRING;
const targetDevice = process.env.IOTHUB_DEVICE_ID_Alarmlicht;
const MQTT_URL = "mqtt://broker.hivemq.com:1883";

const alarmlichten = {
    "1": { type: "mqtt",   topic: "aashish/practicum5" },
    "2": { type: "iothub", deviceId: process.env.IOTHUB_DEVICE_ID_Alarmlicht}
};


let client = null;

function invokeMethod(methodName, payload) {
    const methodParams = {
        methodName: methodName,
        payload: payload || null,
        responseTimeoutInSeconds: 15
    };
    return new Promise((resolve, reject) => {
        client.invokeDeviceMethod(targetDevice, methodParams, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

app.http('iotAlarmlicht', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'iot/alarmlicht',
    handler: async (request, context) => {
        client = Client.fromConnectionString(connectionString);   // synchroon, geen await nodig
        try {
            const body = await request.json();
            context.log(body);
            const antwoord = await invokeMethod('setAlarm', body);
            await client.close();                                  // close(), niet disconnect()
            return {
                status: antwoord.status,                           // 200 of 400 van het device
                jsonBody: { device: targetDevice, antwoordDevice: antwoord.payload }
            };
        } catch (err) {
            context.error(err);
            return { status: 504, jsonBody: { fout: 'Device reageert niet of bestaat niet', detail: err.message } };
        }
    }
});