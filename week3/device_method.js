// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
// Uitgebreid met openDoor / closeDoor en een bijgehouden deurstatus.

'use strict';

require('dotenv').config();

const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
let client = null;

// Simpele status van de deur
const door = {
    open: false,
    log: []
};

function addLog(message) {
    if (door.log.length > 5){
        door.log.shift()
    }
    const entry = new Date().toISOString() + ' - ' + message;
    door.log.push(entry);
    console.log(entry);
}

function main() {
    const deviceConnectionString = process.env.IOTHUB_DEVICE_CONNECTION_STRINGSimulatedDeur;
    client = Client.fromConnectionString(deviceConnectionString, Protocol);
    client.open(onConnect);
}

function onConnect(err) {
    if (err) {
        console.error('Could not connect: ' + err.message);
    } else {
        console.log('Connected to device. Registering handlers for methods.');
        client.onDeviceMethod('getDeviceLog', onGetDeviceLog);
        client.onDeviceMethod('getDeviceStatus', onGetDeviceStatus);
        client.onDeviceMethod('openDoor', onOpenDoor);
        client.onDeviceMethod('closeDoor', onCloseDoor);
    }
}

function onGetDeviceStatus(request, response){
    printDeviceMethodRequest(request);
    return sendResponse(request, response, 200, {status: door.open ? "open" : "dicht"})
}
function onOpenDoor(request, response) {
    printDeviceMethodRequest(request);
    if (door.open) {
        return sendResponse(request, response, 200, { result: 'Deur was al open', door: door.open ? 'open' : 'dicht' });
    }
    door.open = true;
    addLog('Deur geopend');
    sendResponse(request, response, 200, { result: 'Deur geopend', door: 'open' });
}

function onCloseDoor(request, response) {
    printDeviceMethodRequest(request);

    if (!door.open) {
        return sendResponse(request, response, 200, { result: 'Deur was al dicht', door: 'dicht' });
    }
    door.open = false;
    addLog('Deur gesloten');
    sendResponse(request, response, 200, { result: 'Deur gesloten', door: 'dicht' });
}

function onGetDeviceLog(request, response) {
    printDeviceMethodRequest(request);
    sendResponse(request, response, 200, { door: door.open ? 'open' : 'dicht', log: door.log });
}

function sendResponse(request, response, status, payload) {
    response.send(status, payload, function (err) {
        if (err) {
            console.error('An error ocurred when sending a method response:\n' + err.toString());
        } else {
            console.log('Response to method \'' + request.methodName + '\' sent successfully.');
        }
    });
}

function printDeviceMethodRequest(request) {
    console.log('Received method call for method \'' + request.methodName + '\'');
    if (request.payload) {
        console.log('Payload:\n' + JSON.stringify(request.payload));
    }
}

main();