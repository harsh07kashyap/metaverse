import { useEffect } from "react";
import createGame from "./PhaserGame";

const Game = () => {
  useEffect(() => {
    createGame();
  }, []);

  return <div id="game-container"></div>;
};

export default Game;
