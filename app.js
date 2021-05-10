const client = require("./src/connect");
const { ExceptionConsole } = require("./src/utils");

const process = require("process");
process.stdin.setEncoding("utf8");

const dataMockWords = []
let [ 
    flag,
    isStart,
    dataMockWordsTampon,
    randomIndex,
    maxCounter
] = [ true, false, null, null, 7 ];
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

        checkIsWin(objectWord.word)
    } else if (str.length > 1) {
        if (str === objectWord.word) 
            hideWord = str

        console.log("hideword ", hideWord);
        console.log("oject word : ", objectWord.word);
        checkIsWin(objectWord.word)
    } else {
        console.log("***Aucune lettre trouvée***");
    }
}

const checkIsWin = (word) => {
    if (hideWord === word) {
        console.log("WINNER !!!");
        status = "Winner";
        process.stdin.pause();
    } else {
        counter++;
    }
}

const movesRemaining = () => {
    return (maxCounter - counter) + 1
}

const game = async() => {
    try {
        await client.connect();

        const database = client.db("tp-pendu");
        const mockWords = database.collection("mockWords");

        let [ status, player ] = [ "Progress", null ];
        hideWord = "";
        counter = 1;

        process.stdin.on("data", async (data) => {
            try {
                const input = data.toString().trim();

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
                    process.stdout.write("> ");
                } else {
                    if (counter < maxCounter) {
                        comparedLetter(input, dataMockWords[randomIndex]);

                        console.log(`\n[-----${movesRemaining()}-----]`);
                        console.log("hide word : ", hideWord);
                        console.log(`status: ${status}`);
                        process.stdout.write("> ");
                    } else {
                        status = "Loser";
                        console.log("\n----------------");
                        console.log(`status: ${status}`);
                        process.stdin.pause();
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

console.log("Press \"q\" for leave or enter your peusdo");
process.stdout.write("> ");

game().catch(console.dir);