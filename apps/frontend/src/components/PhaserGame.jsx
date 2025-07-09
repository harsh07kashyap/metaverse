import Phaser from "phaser";
import GameScene from "./Gamescene";

export default function createGame() {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [GameScene],
    parent: "game-container",
    physics: {
      default: "arcade",
      arcade: { debug: false },
    },
  });
}
