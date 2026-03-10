import express from "express";

const router = express.Router();

let game = {
    word: "",
    turn: "",
}

router.get("/start", async (req, res)=>{
    try{
        let data = await fetch("https://random-word-api.herokuapp.com/word?length=5");
        data = await data.json()
        game.word = data[0].toUpperCase();
        game.turn =1;
        console.log(game.word);

        return res.status(200).json({success: "Game Start"})
    }
    catch (err){ console.log(err); return res.status(500).json({error: "Uh Oh"});}
});

function exists(req, res){
    if(!game.word) return res.redirect("/");
}

router.post("/submit", async (req, res)=>{
    try{
        if(game.turn > 6) return res.status(200).json({failed: "The Game Is Over"})
        let {guess} = req.body; console.log(guess);


        if(guess.length != 5) return res.status(200).json({failed: "Not enough letters"});

        const real = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`);
        if(!real.ok) return res.status(200).json({failed: "Not in word list"});

        let response = "";
        for(let i =0; i < 5; i++){
            let temp = 0;
            if(game.word.includes(guess[i])) temp = 1;
            if(game.word[i] == guess[i]) temp = 2;
            response += temp;
        }

        game.turn++;
        return res.status(200).json({success: response, win: game.word == guess});
    }
    catch(err){ console.log(err); return res.status(500).json({error: "Uh Oh"});}
})

export {router, exists};