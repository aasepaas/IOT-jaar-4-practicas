'use strict';

require('dotenv').config();

const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;

let client = null;
let twin = null;

// Toestand van de deur
const door = {
    open: false,
    log: [],
    autoCloseSeconds: 0,   // komt uit de desired properties
    autoCloseTimer: null
};

function main() {
    const deviceConnectionString = process.env.IOTHUB_DEVICE_CONNECTIOn_STRING_DeurDeviceTwin;
    client = Client.fromConnectionString(deviceConnectionString, Protocol);
    client.open(onConnect);
}

function onConnect(err) {
    if (err) {
        console.error('Could not connect: ' + err.message);
        return;
    }
    console.log('Connected to device. Registering handlers for methods.');
    client.onDeviceMethod('getDeviceLog', onGetDeviceLog);
    client.onDeviceMethod('getDeviceStatus', onGetDeviceStatus);
    client.onDeviceMethod('doorActions', doorActions);
    client.getTwin((err, deviceTwin) => {
        if (err) {
            console.error('Kon twin niet ophalen: ' + err.message);
            return;
        }
        twin = deviceTwin;
        console.log('Twin opgehaald.');
        twin.on('properties.desired', onDesiredChange);
        reportState();
    });
}

// ---------- Device twin ----------

function onDesiredChange(delta) {
    console.log('Desired properties ontvangen: ' + JSON.stringify(delta));

    if (delta.autoCloseSeconds === undefined) {
        return; 
    }

    const waarde = delta.autoCloseSeconds;
    if (typeof waarde !== 'number' || waarde < 0) {
        console.log('Ongeldige waarde voor autoCloseSeconds: ' + waarde);
        return;
    }

    door.autoCloseSeconds = waarde;
    addLog('autoCloseSeconds ingesteld op ' + waarde);

    // Staat de deur al open, dan de timer opnieuw starten met de nieuwe waarde
    if (door.open) {
        startAutoCloseTimer();
    }
    reportState();
}

function reportState() {
    if (!twin) {
        return;
    }
    const patch = {
        doorState: door.open ? 'open' : 'dicht',
        autoCloseSeconds: door.autoCloseSeconds,
        lastChanged: new Date().toISOString()
    };
    twin.properties.reported.update(patch, (err) => {
        if (err) {
            console.error('Kon reported properties niet bijwerken: ' + err.message);
        } else {
            console.log('Reported properties bijgewerkt: ' + JSON.stringify(patch));
        }
    });
}

function startAutoCloseTimer() {
    stopAutoCloseTimer();
    if (door.autoCloseSeconds > 0) {
        console.log('Deur sluit automatisch over ' + door.autoCloseSeconds + ' seconden');
        door.autoCloseTimer = setTimeout(() => {
            door.autoCloseTimer = null;
            if (door.open) {
                door.open = false;
                addLog('Deur automatisch gesloten');
                reportState();
            }
        }, door.autoCloseSeconds * 1000);
    }
}

function stopAutoCloseTimer() {
    if (door.autoCloseTimer !== null) {
        clearTimeout(door.autoCloseTimer);
        door.autoCloseTimer = null;
    }
}

function doorActions(request, response) {
    printDeviceMethodRequest(request);
    let data = request.payload;
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            return sendResponse(request, response, 400, { result: 'Ongeldige JSON: ' + e.message });
        }
    }

    const actie = data ? data.deurStatusToSend : null;

    if (actie === 'open') {
        openDoor(request, response);
    } else if (actie === 'close') {
        closeDoor(request, response);
    } else {
        console.log('Geen geldige deur status ontvangen om uit te voeren');
        sendResponse(request, response, 400, { result: 'Onbekende actie: ' + actie });
    }
}

function openDoor(request, response) {
    if (door.open) {
        return sendResponse(request, response, 200, { result: 'Deur was al open', door: 'open' });
    }
    door.open = true;
    addLog('Deur geopend');
    startAutoCloseTimer();
    reportState();
    sendResponse(request, response, 200, {
        result: 'Deur geopend',
        door: 'open',
        autoCloseSeconds: door.autoCloseSeconds
    });
}

function closeDoor(request, response) {
    if (!door.open) {
        return sendResponse(request, response, 200, { result: 'Deur was al dicht', door: 'dicht' });
    }
    door.open = false;
    stopAutoCloseTimer();
    addLog('Deur gesloten');
    reportState();
    sendResponse(request, response, 200, { result: 'Deur gesloten', door: 'dicht' });
}

function onGetDeviceStatus(request, response) {
    printDeviceMethodRequest(request);
    sendResponse(request, response, 200, {
        status: door.open ? 'open' : 'dicht',
        autoCloseSeconds: door.autoCloseSeconds
    });
}

function onGetDeviceLog(request, response) {
    printDeviceMethodRequest(request);
    sendResponse(request, response, 200, { door: door.open ? 'open' : 'dicht', log: door.log });
}

function addLog(message) {
    const entry = new Date().toISOString() + ' - ' + message;
    door.log.push(entry);
    if (door.log.length > 5) {
        door.log.shift();
    }
    console.log(entry);
}

function sendResponse(request, response, status, payload) {
    response.send(status, payload, (err) => {
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