
import "../css/general.css"
import "../css/start.css"
import {useNavigate} from "react-router-dom";

export default function Start(){
    const navigate = useNavigate();

    async function startGame(){
        let res = await fetch("/start");
        res = await res.json();
        if(res.error) console.log("Uh Oh")
        else navigate("/game");
    }
    
    return(
        <>
        <div className="wholePage">
            <div className="startContainer">
                <div>
                    <div>Wordle</div>
                    <div>Get 6 chances to guess a 5-letter word.</div>
                    <div>
                        <div className="button">75% off</div>
                        <div className="button">Log in</div>
                        <div className="button" style={{ color: "white", backgroundColor: "black" }} onClick={()=>startGame()}>Play</div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}