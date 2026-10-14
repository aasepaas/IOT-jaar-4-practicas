const fs = require('fs/promises');
const path = require('path');

main();
async function main(){
    console.log('1. start script');

    try{
        const data = await fs.readFile('file.txt', 'utf8');
        console.log('2.inhoud bestand:\n' + data);
    } catch (error) {
        console.error('Fout bij het lezen van het bestand:', error.message);
    }
    
    console.log("3. einde script")
}


