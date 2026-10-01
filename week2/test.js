
// message = "hello man world"

// msgSplit = message.split(" ")
// console.log(msgSplit)

// if ("quit" in msgSplit){
//     console.log("quit found")
//     rl.close();
//     process.exit(0);
// } else if (msgSplit.includes("hello")){
//     console.log("hello found")
// }else{
//     console.log("nothing found")
// }


// console.log(msgSplit)

const chalk = require('chalk');
const { stdin: input, stdout: output } = require('node:process');

process.stdout.write("aan");
toggle = false;
setInterval(print, 1000);

function print() {
    process.stdout.cursorTo(0);
    if (toggle) { 
        process.stdout.write("   ");
    }
    else {
        process.stdout.write(chalk.rgb(0,255,0)("aan"));
    }
    toggle= (!toggle);
}

// lampOff = 5
// lampOffBeheerder = null

// if (lampOff >  lampOffBeheerder){
//     console.log("lampOffBeheerder is groter dan lampOfaasdasdaasdasdf")
// }

// lampOffBeheerder = 10 

// if (lampOff > lampOffBeheerder){
//     console.log("lampOffBeheerder is groter dan lampOff")
// }