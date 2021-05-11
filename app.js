const client = require("./src/connect");
const { ExceptionConsole } = require("./src/utils");

const process = require("process");
process.stdin.setEncoding("utf8");

const dataMockWords = []
let [ 
    status,
    flag,
    isStart,
    dataMockWordsTampon,
    randomIndex,
    maxCounter
] = [ "", true, false, null, null, 7 ];
let counter;
let hideWord;

const randomNumber = () => {
    return Math.floor(Math.random() * dataMockWords.length);
}

const comparedLetter = (str, objectWord) => {

    if (str.length === 1) {
        for (let i = 0; i < objectWord.word.length; i++) {
            if(str === objectWord.word[i]) {
                let hideWordTampon = hideWord.split("");
                hideWordTampon[i] = str; 
                hideWord = hideWordTampon.join("");
            }
        }
    } else if (str.length > 1) {
        if (str === objectWord.word) hideWord = str;
            
    } else {
            console.log("\n\n***Aucune lettre trouvée***");
    }
    checkIsWin(objectWord.word);
}

const checkIsWin = (word) => {
    console.log("check hide word :", hideWord);
    console.log("check word ", word);
    if (hideWord === word) {
        status = "Winner";
    } else {
        counter++;
    }
}

const endOfGame = async() => {
    console.log("\n----------------");
    console.log(`status: ${status}`);
    console.log("Press \"q\" for leave or enter your peusdo for restart")
    process.stdout.write("> ");
}

const movesRemaining = () => {
    return (maxCounter - counter) + 1
}

const changeHideWord = () => {
    console.log(dataMockWords.length);
    dataMockWords.splice(randomIndex, 1);
    console.log(dataMockWords.length);

    randomIndex = randomNumber();
}


const game = async() => {
    try {
        await client.connect();

        const database = client.db("tp-pendu");
        const mockWords = database.collection("mockWords");

        let player = "";
        status = "Progress";
        hideWord = "";
        counter = 1;
        isStart = false;
        
        process.stdin.on("data", async (data) => {
            try {
                const input = data.toString().trim();

                if (status === "Winner" || status === "Loser") {
                    changeHideWord();

                    status = "Progress";
                    hideWord = dataMockWords[randomIndex].hide
                    counter = 1;
                    isStart = false;

                    if (dataMockWords.length === 0) flag = true;
                }

                if (!isStart) {
                    if (input.toUpperCase() === "Q") {
                        throw new ExceptionConsole("By");
                    }
                    else {
                        player = input;
                        isStart = true;
                    }
                    
                    if (flag) {
                        dataMockWordsTampon = await mockWords.find();
                        flag = false;
                    }
                    
                    if (dataMockWords.length === 0) {
                        await dataMockWordsTampon.forEach(doc => dataMockWords.push(doc) );
                        randomIndex = randomNumber();
                        hideWord = dataMockWords[randomIndex].hide
                    }

                        
                    console.log(`\n[-----${movesRemaining()}-----]`);
                    console.log("hide word : ", hideWord);
                    console.log(`status: ${status}`);
                    process.stdout.write("> ");
                } else {
                    if (counter < maxCounter) {
                        comparedLetter(input, dataMockWords[randomIndex]);

                        if (status === "Winner")
                            endOfGame();

                        if (status === "Progress") {
                            console.log(`\n[-----${movesRemaining()}-----]`);
                            console.log("hide word : ", hideWord);
                            console.log(`status: ${status}`);
                            process.stdout.write("> ");
                        }
                    } else {
                        status = "Loser";
                        endOfGame();
                    }
                }
            } catch(e) {
                await client.close();
                process.stdin.pause();
                console.log(e.message);
            }
        });
    } catch(e) {
        console.log("probleme de connexion", e.message);
        await client.close();
    } finally {
        //
    }
}

console.log("----------------------------------------");
console.log("----------------------------------------");
console.log("------------  Jeu du pendu  ------------");
console.log("----------------------------------------");
console.log("----------------------------------------\n");

console.log("Press \"q\" for leave or enter your peusdo for play");
process.stdout.write("> ");

game().catch(console.dir);