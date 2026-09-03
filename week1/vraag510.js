const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const rl = readline.createInterface({ input, output });

function answerHandler(answer){
    console.log(`Thank you for your valuable feedback: ${answer}`);
    if(answer == "quit"){
	    rl.close();
	    process.exit(1);
	  }

}

rl.on('line', answerHandler);

setInterval(() => {
  console.log("intervaltimerrr");
}, 1000);
