'use strict';

require('dotenv').config();

const chalk = require('chalk');
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;````

// Device connection string uit de environment (niet hardcoden i.v.m. security)
const deviceConnectionString = process.env.IOTHUB_DEVICE_CONNECTION_STRING_Alarmlicht;

let client = null;

let alarmTimer = null;
let alarmAan = false;
let alarmStatus = false;

let interval = 1000;

let color = {
    r: 0,
    g: 255,
    b: 0
};

function main() {

    client = Client.fromConnectionString(deviceConnectionString, Protocol);

    client.on('error', (err) => {
        console.error('Client error: ' + err.message);
    });

    client.open(onConnect);
}

function onConnect(err) {
    if (err) {
        console.error('Kon niet verbinden met Azure IoT Hub: ' + err.message);
        return;
    }
    console.log('Verbonden met Azure IoT Hub. Registreren van device methods...');

    client.onDeviceMethod('setAlarm', onSetAlarm);
    client.onDeviceMethod('getAlarmStatus', onGetAlarmStatus);
}

function onSetAlarm(request, response) {
    console.log('Method ontvangen: ' + request.methodName);
    console.log('Payload: ' + JSON.stringify(request.payload));

    // De SDK heeft de JSON meestal al geparset; alleen een string zetten we zelf om
    let data = request.payload;
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            return sendResponse(request, response, 400, { result: 'Ongeldige JSON: ' + e.message });
        }
    }

    if (!validateMessage(data)) {
        console.log('Ongeldig alarmlicht bericht');
        return sendResponse(request, response, 400, { result: 'Ongeldig alarmlicht bericht' });
    }

    interval = data.interval;
    color = data.color;

    if (data.status === true) {
        startAlarm();
    } else {
        stopAlarm();
    }

    sendResponse(request, response, 200, {
        result: alarmStatus ? 'Alarm aangezet' : 'Alarm uitgezet',
        status: alarmStatus,
        interval: interval,
        color: color
    });
}

// Direct method: huidige status opvragen
function onGetAlarmStatus(request, response) {
    console.log('Method ontvangen: ' + request.methodName);
    sendResponse(request, response, 200, {
        status: alarmStatus,
        interval: interval,
        color: color
    });
}

function sendResponse(request, response, status, payload) {
    response.send(status, payload, (err) => {
        if (err) {
            console.error('Fout bij versturen van response: ' + err.message);
        } else {
            console.log('Response op \'' + request.methodName + '\' verstuurd (status ' + status + ').');
        }
    });
}

function printAlarm() {
    process.stdout.cursorTo(0);
    if (alarmAan) {
        process.stdout.write('                 ');
        alarmAan = false;
    } else {
        process.stdout.write(chalk.rgb(color.r, color.g, color.b)('ALARM AAN'));
        alarmAan = true;
    }
}

function startAlarm() {
    stopAlarm();
    alarmStatus = true;
    console.log(`Alarmlicht gestart: interval=${interval}ms RGB=(${color.r},${color.g},${color.b})`);
    printAlarm();
    alarmTimer = setInterval(printAlarm, interval);
}

function stopAlarm() {
    alarmStatus = false;
    if (alarmTimer !== null) {
        clearInterval(alarmTimer);
        alarmTimer = null;
    }
    process.stdout.cursorTo(0);
    process.stdout.write('                 ');
    alarmAan = false;
    console.log('\nAlarmlicht uit');
}

function validateMessage(msg) {
    if (typeof msg !== 'object' || msg === null) {
        return false;
    }
    if (msg.type !== 'alarmlicht') {
        return false;
    }
    if (typeof msg.status !== 'boolean') {
        return false;
    }
    if (typeof msg.interval !== 'number' || msg.interval <= 0) {
        return false;
    }
    if (!msg.color ||
        typeof msg.color.r !== 'number' ||
        typeof msg.color.g !== 'number' ||
        typeof msg.color.b !== 'number') {
        return false;
    }
    if (msg.color.r < 0 || msg.color.r > 255 ||
        msg.color.g < 0 || msg.color.g > 255 ||
        msg.color.b < 0 || msg.color.b > 255) {
        return false;
    }
    return true;
}

main();