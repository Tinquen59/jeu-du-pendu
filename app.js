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
    maxCounter,
    player,
    letterUsed
] = [ "", true, false, null, null, 7, "", [] ];
let counter;
let hideWord;

/**
 * 
 * @returns un nombre aléatoire par rapport à la longueur de dataMockWords
 */
const randomNumber = () => Math.floor(Math.random() * dataMockWords.length)

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
        return console.log("\n\n***Aucune lettre trouvée***");
    }
    letterUsed.push(str);
    checkIsWin(objectWord.word);
}

/**
 * vérifie si le mot caché est identique au mot
 * @param {*} word est le mot complet
 */
const checkIsWin = word => {
    hideWord === word ? status = "Winner" : counter++
}

/**
 * affiche les consoles.log() en fin de partie
 */
const endOfGame = async() => {
    console.log("\n----------------");
    console.log(`status: ${status}`);
    console.log("Press \"q\" for leave or enter your peusdo for restart")
    process.stdout.write("> ");
}

/**
 * 
 * @returns le nombre de coups restants
 */
const movesRemaining = () => (maxCounter - counter) + 1

/**
 * supprime le mot caché de la variable et change d'index
 */
const changeHideWord = async() => {
    dataMockWords.splice(randomIndex, 1);

    randomIndex = randomNumber();
}

/**
 * affiche les console.log() pendant la partie
 */
const inProgesse = () => {
    console.log(`\n[-----${movesRemaining()}-----]`);
    console.log("hide word : ", hideWord);
    console.log(`status: ${status}`);
    process.stdout.write("> ");
}


const game = async() => {
    try {
        await client.connect();

        const database = client.db("tp-pendu");
        const mockWords = database.collection("mockWords");
        const resultScore = database.collection("score");

        status = "Progress";
        hideWord = "";
        counter = 1;
        isStart = false;
        
        process.stdin.on("data", async (data) => {
            try {
                const input = data.toString().trim();

                // remet tout à zéro, change de mot caché et ajoute le score dans la bdd à la fin de la partie
                if (status === "Winner" || status === "Loser") {
                    let docScore = {
                        name: player,
                        word: dataMockWords[randomIndex].word,
                        beginHide: dataMockWords[randomIndex].hide,
                        endHide: hideWord,
                        status,
                        counter,
                        date: new Date(),
                        letterUsed
                    }
                    await resultScore.insertOne(docScore);

                    changeHideWord();

                    status = "Progress";
                    hideWord = dataMockWords[randomIndex].hide
                    counter = 1;
                    isStart = false;
                    letterUsed = [];

                    if (dataMockWords.length === 0) flag = true;
                }

                if (!isStart) {
                    // si "Q" on quitte sinon on stocke le nom du joueur et on lance la partie
                    if (input.toUpperCase() === "Q") {
                        throw new ExceptionConsole("By");
                    }
                    else {
                        player = input;
                        isStart = true;
                    }
                    
                    // fait une requête vers la bdd pour récupérer les mots
                    if (flag) {
                        dataMockWordsTampon = await mockWords.find();
                        flag = false;
                    }
                    
                    // créé un tableau avec les données de la requête précédente et créé le mot caché
                    if (dataMockWords.length === 0) {
                        await dataMockWordsTampon.forEach(doc => dataMockWords.push(doc) );

                        randomIndex = randomNumber();
                        hideWord = dataMockWords[randomIndex].hide
                    }

                    inProgesse();
                } else {
                    if (counter < maxCounter) {
                        comparedLetter(input, dataMockWords[randomIndex]);

                        if (status === "Winner") endOfGame();

                        if (status === "Progress") inProgesse();
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