//programma met synchrone functie aanroep

function print(naam, leeftijd) {
    console.log(`Hallo ${naam}. U bent ${leeftijd}`);
}



print("jan", 22)

setTimeout(print, 2000, "jan na timeout", 22)

const myinterval = setInterval(print, 2000, "jan na interval", 22)

function stopInterval(){
    clearInterval(myinterval)
    console.log("stop interval")
}

setTimeout(stopInterval, 20000)