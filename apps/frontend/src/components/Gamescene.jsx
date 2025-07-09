import Phaser from "phaser";
const tmjfile="../assets/maps/untitled.tmj"
const titleatlas="../assets/maps/tile_atlas.png"
const playersprite="../assets/maps/download.png"

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    // Load the Tiled map
    console.log(tmjfile)
    this.load.tilemapTiledJSON("map", tmjfile); // Path to your exported .tmj file

    // Load the tileset image (make sure the filename matches what you used in Tiled)
    this.load.image("tilesetImage", titleatlas);

    // Load player sprite
    this.load.image("player", playersprite);
  }

  create() {
    // Load the map
    this.map = this.make.tilemap({ key: "map" });

    // Load the tileset (ensure name matches the Tiled map tileset name)
    this.tileset = this.map.addTilesetImage("new1", "tilesetImage"); 

    // Create the background layer
    this.layer = this.map.createLayer("Tile Layer 1", this.tileset, 0, 0);

    // WebSocket connection
    this.ws = new WebSocket("ws://localhost:3001"); // Replace with your WebSocket URL

    this.ws.onopen = () => {
      console.log("Connected to WebSocket");
      this.ws.send(JSON.stringify({ type: "join", payload: { spaceId: "1234", token: "yourToken" } }));
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleWebSocketMessage(message);
    };

    // Create player group
    this.players = this.add.group();

    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  handleWebSocketMessage(message) {
    switch (message.type) {
      case "space-joined":
        this.spawnPlayer(message.payload);
        break;

      case "user-joined":
        this.addOtherPlayer(message.payload);
        break;

      case "movement":
        this.updatePlayerPosition(message.payload);
        break;

      case "user-left":
        this.removePlayer(message.payload.userId);
        break;
    }
  }

  spawnPlayer(payload) {
    this.currentPlayer = this.add.sprite(payload.spawn.x * 32, payload.spawn.y * 32, "player");
    this.currentPlayer.userId = payload.userId;
    this.players.add(this.currentPlayer);
  }

  addOtherPlayer(payload) {
    const otherPlayer = this.add.sprite(payload.x * 32, payload.y * 32, "player");
    otherPlayer.userId = payload.userId;
    this.players.add(otherPlayer);
  }

  updatePlayerPosition(payload) {
    const player = this.players.getChildren().find(p => p.userId === payload.userId);
    if (player) {
      player.x = payload.x * 32;
      player.y = payload.y * 32;
    }
  }

  removePlayer(userId) {
    const player = this.players.getChildren().find(p => p.userId === userId);
    if (player) {
      player.destroy();
    }
  }

  update() {
    if (!this.currentPlayer) return;

    let newX = this.currentPlayer.x;
    let newY = this.currentPlayer.y;

    if (this.cursors.left.isDown) newX -= 32;
    if (this.cursors.right.isDown) newX += 32;
    if (this.cursors.up.isDown) newY -= 32;
    if (this.cursors.down.isDown) newY += 32;

    this.ws.send(JSON.stringify({
      type: "move",
      payload: { x: newX / 32, y: newY / 32, userId: this.currentPlayer.userId }
    }));
  }
}
