# jeu-du-pendu

## How to start ?

After clone this project run in your cmd :

```bash
mongod
```

open new cmd and run :
```bash
mongo
...
...
...
> use tp-pendu
```

then run :
```bash
const MockWords = [
    { word: "cornedrue", hide: "#o###d###" },
    { word: "cognards", hide: "c######s" },
    { word: "fourchelang", hide: "########a#g" },
    { word: "gringotts", hide: "#######tts" },
    { word: "hyppogriffes", hide: "####o######s" },
];

db.mockWords.insertMany(MockWords);
```

Open your favorite IDE with the project and install node modules :

```bash
npm install
```

Now you can play with :

```bash
npm run start
```