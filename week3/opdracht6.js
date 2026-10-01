// Service-app die direct methods op het IoT-device (de deur) aanroept.
// Gebaseerd op device_method.js uit de azure-iothub service SDK samples.


require('dotenv').config();
'use strict';
const Client = require('azure-iothub').Client;
const readline = require('readline');

// Connection string en device-id komen uit environment variabelen (niet hardcoden i.v.m. security)
const connectionString = process.env.IOTHUB_SERVICE_CONNECTION_STRING;
const targetDevice = process.env.IOTHUB_DEVICE_ID_Deur;

const client = Client.fromConnectionString(connectionString);

// Koppeling tussen console-commando's en direct method namen op het device
const commands = {
    open:  { methodName: 'doorActions',     description: 'Deur openen', deurStatus: 'open'},
    dicht: { methodName: 'doorActions',    description: 'Deur sluiten', deurStatus: 'close' },
    log:   { methodName: 'getDeviceLog', description: 'Device log ophalen' },
    status: {methodName: 'getDeviceStatus', description: "Ophalen huidige deur status"}
};

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

function printHelp() {
    console.log('\nBeschikbare commando\'s:');
    Object.keys(commands).forEach((key) => {
        console.log('  ' + key + ' - ' + commands[key].description);
    });
    console.log('  help - Dit overzicht tonen');
    console.log('  exit - Afsluiten\n');
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "deurInput> "
});

console.log('Door service gestart voor device \'' + targetDevice + '\'.');
printHelp();
rl.prompt();

rl.on('line', async (line) => {
    const input = line.trim().toLowerCase();

    if (input === 'exit') {
        rl.close();
        return;
    }
    if (input === 'help' || input === '') {
        printHelp();
        rl.prompt();
        return;
    }

    const command = commands[input];
    if (!command) {
        console.log('Onbekend commando: \'' + input + '\'. Typ \'help\' voor opties.');
        rl.prompt();
        return;
    }

    //deurStatusToSend = command.deurStatus ?? 0
    console.log('Aanroepen van \'' + command.methodName + '\'...');
    try {
        const result = await invokeMethod(command.methodName, {deurStatusToSend: command.deurStatus, requestedAt: new Date().toISOString() });
        console.log('Status: ' + result.status);
        console.log('Antwoord van device: ' + JSON.stringify(result.payload, null, 2));
    } catch (err) {
        console.error('Fout bij aanroepen van \'' + command.methodName + '\': ' + err.message);
    }
    rl.prompt();
});

rl.on('close', () => {
    console.log('Door service gestopt.');
    process.exit(0);
});