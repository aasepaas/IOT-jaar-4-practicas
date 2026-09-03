const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/*rl.on('line', (input) => {
  console.log(`Received: ${input}`);
});*/

//console.log("Press enter voor beweging");

function inputHandler(input){
  console.log(`Received: ${input}`);

  if(input == "quit"){
    rl.close();
    process.exit(1);
  }
}

rl.on('line', inputHandler);

setInterval(() => {
  console.log("intervaltimerrr");
}, 1000);

rl.question("Wat is je naam? ", inputHandler);
