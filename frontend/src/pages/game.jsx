import "../css/general.css";
import "../css/game.css";
import { useState, useEffect } from "react";

export default function Game() {
    const [board, setBoard] = useState(
        Array.from({ length: 6 }, () =>
            Array.from({ length: 5 }, () => ({ letter: "", state: "default" }))
        )
    );

    const [guess, setGuess] = useState("");
    const [turn, setTurn] = useState(1);
    const [over, setOver] = useState(false);

    const [keyStates, setKeyStates] = useState({
        Q: "default", W: "default", E: "default", R: "default", T: "default",
        Y: "default", U: "default", I: "default", O: "default", P: "default",
        A: "default", S: "default", D: "default", F: "default", G: "default",
        H: "default", J: "default", K: "default", L: "default",
        Z: "default", X: "default", C: "default", V: "default", B: "default",
        N: "default", M: "default"
    });

    function typed(letter) {
        setGuess(prevGuess => {
            if (letter && prevGuess.length < 5) return prevGuess + letter;
            if (!letter && prevGuess.length > 0) return prevGuess.slice(0, -1);
            return prevGuess;
        });
    }

    function upgradeKeyState(oldState, newState) {
        if (oldState === "correct") return "correct";
        if (oldState === "present" && newState !== "correct") return "present";
        if (oldState === "absent" && newState === "default") return "absent";
        return newState;
    }

    async function submit() {
        if (turn > 6) {
            console.log("Game Over");
            return;
        }

        if (guess.length !== 5) {
            console.log("Not Enough Letters");
            return;
        }

        const submittedGuess = guess;

        let res = await fetch("/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guess: submittedGuess })
        });

        res = await res.json();

        if (res.error) {
            console.log("Uh Oh");
            return;
        }

        if (res.failed) {
            console.log(res.failed);
            return;
        }

        const result = res.success;

        if (typeof result !== "string" || result.length !== 5) {
            console.log("Bad server response:", res);
            return;
        }

        setBoard(prevBoard => {
            const newBoard = prevBoard.map(row =>
                row.map(cell => ({ ...cell }))
            );

            for (let i = 0; i < 5; i++) {
                let state = "default";
                if (result[i] === "0") state = "absent";
                else if (result[i] === "1") state = "present";
                else if (result[i] === "2") state = "correct";

                newBoard[turn - 1][i] = {
                    letter: submittedGuess[i],
                    state
                };
            }

            return newBoard;
        });

        setKeyStates(prevKeyStates => {
            const newKeyStates = { ...prevKeyStates };

            for (let i = 0; i < 5; i++) {
                const letter = submittedGuess[i];
                let newState = "default";

                if (result[i] === "0") newState = "absent";
                else if (result[i] === "1") newState = "present";
                else if (result[i] === "2") newState = "correct";

                newKeyStates[letter] = upgradeKeyState(newKeyStates[letter], newState);
            }

            return newKeyStates;
        });

        setTurn(prev => prev + 1);
        setGuess("");

        if(res.win){ console.log("You won!")};
        if(turn > 6) {console.log("You lose!")};
    }

    function handleKeyDown(e) {
        const key = e.key.toUpperCase();
        if (key === "ENTER") {submit();}
        else if (key === "BACKSPACE") { typed(null);}
        else if (/^[A-Z]$/.test(key)) {typed(key);}
    }

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);

        return () => {document.removeEventListener("keydown", handleKeyDown)};
    }, [guess, turn]);

    useEffect(() => {
        if (turn > 6) return;
        setBoard(prevBoard => {
            const newBoard = prevBoard.map(row =>
                row.map(cell => ({ ...cell }))
            );

            for (let i = 0; i < 5; i++) {
                newBoard[turn - 1][i] = {
                    letter: guess[i] || "",
                    state: "default"
                };
            }

            return newBoard;
        });
    }, [guess, turn]);

    return (
        <>
            <div className="wholePage">
                <div className="gameContainer">
                    <div>
                        <div className="board">
                            {board.flat().map((cell, i) => (
                                <div className={`cell ${cell.state}`} key={i}>
                                    {cell.letter}
                                </div>
                            ))}
                        </div>

                        <div className="keyboard">
                            <div>
                                {"QWERTYUIOP".split("").map((letter, i) => (
                                    <div
                                        className={`letter ${keyStates[letter]}`}
                                        key={i}
                                        onClick={() => typed(letter)}
                                    >
                                        {letter}
                                    </div>
                                ))}
                            </div>

                            <div>
                                {"ASDFGHJKL".split("").map((letter, i) => (
                                    <div
                                        className={`letter ${keyStates[letter]}`}
                                        key={i}
                                        onClick={() => typed(letter)}
                                    >
                                        {letter}
                                    </div>
                                ))}
                            </div>

                            <div>
                                <div className="nonLetter" onClick={submit}>Enter</div>
                                <div>
                                    {"ZXCVBNM".split("").map((letter, i) => (
                                        <div
                                            className={`letter ${keyStates[letter]}`}
                                            key={i}
                                            onClick={() => typed(letter)}
                                        >
                                            {letter}
                                        </div>
                                    ))}
                                </div>

                                <div className="nonLetter" onClick={() => typed(null)}>Backspace</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}