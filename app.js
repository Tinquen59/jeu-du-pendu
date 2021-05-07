const client = require("./src/connect");
const { ExceptionConsole } = require("./src/utils");

const process = require("process");
process.stdin.setEncoding("utf8");

let [ flag, dataMockWords ] = [ true, null ];

async function game() {
    try {
        await client.connect();

        const database = client.db("tp-pendu");
        const mockWords = database.collection("mockWords");

        process.stdin.on("data", async (data) => {
            try {
                console.log("je suis la data :", data)
                const input = data.toString().trim();

                if (input.toUpperCase() === "Q") throw new ExceptionConsole("By");

                if (flag) {
                    dataMockWords = await mockWords.find();
                    flag = false;
                }

                process.stdout.write("> ");
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
console.log("------------  Jeu du pendu  ------------");
console.log("----------------------------------------");
process.stdout.write("> ");

game().catch(console.dir);