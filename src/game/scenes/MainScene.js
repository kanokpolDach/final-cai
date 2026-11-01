import Phaser from "phaser";

const WORLD = { width: 960, height: 640, tile: 32 };

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.interactables = [];
    this.buildingBodies = [];
    this.nearbyTarget = null;
    this.dialogueOpen = false;
    this.interior = false;
    this.walkFrame = 0;
    this.walkTimer = 0;
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.drawWorld();
    this.createTextures();
    this.createBuildings();
    this.createQuestBoard();
    this.createDecorations();
    this.createCharacters();
    this.buildingBodies?.forEach((building) => this.physics.add.collider(this.player, building));
    this.createControls();

    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    this.add.text(18, 16, "COMPUTER REPAIR ADVENTURE", {
      fontFamily: "monospace", fontSize: "16px", color: "#f8fafc",
      backgroundColor: "#172554", padding: { x: 10, y: 8 },
      stroke: "#0f172a", strokeThickness: 3
    }).setScrollFactor(0).setDepth(1000);

    this.hint = this.add.text(480, 590, "เดินสำรวจพื้นที่ แล้วกด E เพื่อโต้ตอบ", {
      fontFamily: "monospace", fontSize: "14px", color: "#ffffff",
      backgroundColor: "#172554", padding: { x: 12, y: 8 },
      align: "center"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    this.prompt = this.add.text(480, 535, "", {
      fontFamily: "monospace", fontSize: "13px", color: "#fff7cc",
      backgroundColor: "#713f12", padding: { x: 10, y: 7 }, align: "center"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setVisible(false);
  }

  drawWorld() {
    const g = this.add.graphics();
    g.fillStyle(0x6d9b55, 1).fillRect(0, 0, WORLD.width, WORLD.height);
    // Pixel grass pattern
    for (let y = 0; y < WORLD.height; y += 32) {
      for (let x = 0; x < WORLD.width; x += 32) {
        const seed = (x * 13 + y * 7) % 5;
        g.fillStyle(seed === 0 ? 0x78a95d : seed === 1 ? 0x638f4c : 0x719f55, 0.55);
        g.fillRect(x + 2, y + 2, 28, 28);
        if (seed === 2 || seed === 4) {
          g.fillStyle(0x91b96b, 0.65).fillRect(x + 8, y + 10, 3, 3);
          g.fillRect(x + 21, y + 23, 3, 3);
        }
      }
    }
    // Main stone paths
    g.fillStyle(0xc5b58a, 1).fillRect(0, 280, WORLD.width, 76);
    g.fillRect(0, 470, WORLD.width, 54);
    g.fillRect(125, 200, 70, 340);
    g.fillRect(445, 200, 70, 340);
    g.fillRect(765, 200, 70, 340);
    for (let x = 0; x < WORLD.width; x += 40) {
      g.lineStyle(1, 0xa8956d, 0.65).lineBetween(x, 280, x, 356);
      g.lineBetween(x, 470, x, 524);
    }
    for (let y = 200; y < 540; y += 38) {
      g.lineStyle(1, 0xa8956d, 0.55).lineBetween(125, y, 195, y);
      g.lineBetween(445, y, 515, y);
      g.lineBetween(765, y, 835, y);
    }
    // Fences around the outer garden
    g.lineStyle(8, 0x795334, 1).strokeRect(8, 8, 944, 624);
    for (let x = 20; x < 950; x += 48) {
      g.fillStyle(0x9a7046, 1).fillRect(x, 5, 7, 15).fillRect(x, 620, 7, 15);
    }
  }

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Player: tiny pixel technician
    g.fillStyle(0x1e293b).fillRect(7, 1, 18, 8);
    g.fillStyle(0xf1c6a5).fillRect(8, 7, 16, 13);
    g.fillStyle(0x253b69).fillRect(6, 19, 20, 12);
    g.fillStyle(0x38bdf8).fillRect(8, 20, 16, 7);
    g.fillStyle(0x334155).fillRect(7, 29, 7, 5).fillRect(19, 29, 7, 5);
    g.fillStyle(0x111827).fillRect(12, 11, 3, 3).fillRect(19, 11, 3, 3);
    g.generateTexture("technician", 32, 36);
    g.clear();
    // NPC technician / teacher
    g.fillStyle(0x3f2d20).fillRect(7, 1, 18, 8);
    g.fillStyle(0xf0c5a1).fillRect(8, 7, 16, 13);
    g.fillStyle(0xf8fafc).fillRect(6, 19, 20, 12);
    g.fillStyle(0x0f766e).fillRect(8, 20, 16, 8);
    g.fillStyle(0x334155).fillRect(7, 29, 7, 5).fillRect(19, 29, 7, 5);
    g.fillStyle(0x111827).fillRect(12, 11, 3, 3).fillRect(19, 11, 3, 3);
    g.generateTexture("npc", 32, 36);
    g.destroy();

    // Eight tiny directional frames create a lightweight pixel walk cycle.
    const directions = ["down", "up", "left", "right"];
    directions.forEach((direction) => {
      [0, 1].forEach((frame) => {
        const art = this.make.graphics({ x: 0, y: 0, add: false });
        const legShift = frame ? 3 : 0;
        art.fillStyle(0x1e293b).fillRect(7, 1, 18, 8);
        art.fillStyle(0xf1c6a5).fillRect(8, 7, 16, 13);
        art.fillStyle(0x2563a6).fillRect(6, 19, 20, 12);
        art.fillStyle(0x38bdf8).fillRect(8, 20, 16, 7);
        art.fillStyle(0x334155).fillRect(7, 29 + (frame ? -legShift : 0), 7, 5);
        art.fillRect(19, 29 + (frame ? legShift : 0), 7, 5);
        if (direction === "down") art.fillStyle(0x111827).fillRect(11, 11, 3, 3).fillRect(19, 11, 3, 3);
        if (direction === "up") art.fillStyle(0x1e293b).fillRect(8, 7, 16, 8);
        if (direction === "left") art.fillStyle(0x111827).fillRect(9, 11, 3, 3);
        if (direction === "right") art.fillStyle(0x111827).fillRect(20, 11, 3, 3);
        art.generateTexture(`player-${direction}-${frame}`, 32, 36);
        art.destroy();
      });
    });
  }

  createBuildings() {
    this.addBuilding(160, 126, "CLASSROOM", 0x3478a8, "learning", "ห้องเรียนอุปกรณ์คอมพิวเตอร์");
    this.addBuilding(480, 126, "COMPUTER SHOP", 0xa87937, "shop", "ร้านขายอุปกรณ์คอมพิวเตอร์");
    this.addBuilding(800, 126, "REPAIR CENTER", 0x7955a5, "mission", "ศูนย์รับซ่อมคอมพิวเตอร์");
  }


  createQuestBoard() {
    const x = 650, y = 385;
    this.add.rectangle(x + 4, y + 8, 88, 72, 0x263238, 0.25).setDepth(2);
    const board = this.add.container(x, y).setDepth(8);
    board.add([
      this.add.rectangle(0, 0, 78, 62, 0x8b5a2b).setStrokeStyle(4, 0x422006),
      this.add.rectangle(0, -2, 62, 45, 0xfef3c7).setStrokeStyle(2, 0x78350f),
      this.add.text(0, -13, "QUEST", { fontFamily: "monospace", fontSize: "11px", color: "#7c2d12", fontStyle: "bold" }).setOrigin(0.5),
      this.add.text(0, 3, "BOARD", { fontFamily: "monospace", fontSize: "10px", color: "#7c2d12" }).setOrigin(0.5)
    ]);
    this.add.rectangle(x, y + 44, 8, 38, 0x713f12).setDepth(7);
    this.add.text(x, y + 54, "กระดานประกาศ · E", {
      fontFamily: "sans-serif", fontSize: "11px", color: "#ffffff",
      backgroundColor: "#172554", padding: { x: 5, y: 3 }
    }).setOrigin(0.5).setDepth(9);
    this.interactables.push({
      x, y: y + 10, type: "board-quests", label: "กระดานประกาศภารกิจ",
      description: "ภารกิจรายวันจากกระดาน"
    });
  }

  addBuilding(x, y, label, color, type, description) {
    const shadow = this.add.rectangle(x + 5, y + 8, 204, 142, 0x263238, 0.3).setDepth(2);
    const building = this.add.container(x, y).setDepth(3);
    const base = this.add.rectangle(0, 8, 200, 132, 0xe8d7ad).setStrokeStyle(5, 0x4b3827);
    const wall = this.add.rectangle(0, 0, 184, 112, color).setStrokeStyle(3, 0x263238);
    const roof = this.add.rectangle(0, -55, 202, 22, 0x713f2a).setStrokeStyle(3, 0x3b241b);
    const sign = this.add.rectangle(0, -18, 158, 28, 0x172554).setStrokeStyle(2, 0xf8fafc);
    const title = this.add.text(0, -18, label, { fontFamily: "monospace", fontSize: "13px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5);
    const door = this.add.rectangle(0, 43, 34, 48, 0x5b3827).setStrokeStyle(3, 0x2b1b12);
    const windowL = this.add.rectangle(-58, 25, 34, 30, 0x9de3ef).setStrokeStyle(3, 0x263238);
    const windowR = this.add.rectangle(58, 25, 34, 30, 0x9de3ef).setStrokeStyle(3, 0x263238);
    building.add([base, wall, roof, sign, title, door, windowL, windowR]);
    this.physics.add.existing(building, true);
    building.body.setSize(190, 130).setOffset(-95, -58);
    this.buildingBodies.push(building);
    shadow.setDepth(1);
    this.add.text(x, y + 91, description, { fontFamily: "sans-serif", fontSize: "11px", color: "#ffffff", backgroundColor: "#263238", padding: { x: 6, y: 4 } }).setOrigin(0.5).setDepth(4);
    this.add.text(x, y + 112, "E", { fontFamily: "monospace", fontSize: "15px", color: "#263238", fontStyle: "bold" }).setOrigin(0.5).setDepth(6);
    this.interactables.push({ x, y: y + 112, type, label, description });
  }

  createDecorations() {
    // Trees and shrubs
    const trees = [[55, 80], [80, 390], [270, 70], [330, 410], [390, 570], [600, 70], [650, 400], [900, 80], [900, 420], [275, 570], [700, 570]];
    trees.forEach(([x, y]) => {
      this.add.ellipse(x + 3, y + 13, 38, 14, 0x365b32, 0.45).setDepth(1);
      this.add.rectangle(x, y + 8, 10, 25, 0x805331).setDepth(2);
      this.add.circle(x, y - 5, 20, 0x2f713f).setStrokeStyle(2, 0x245532).setDepth(3);
      this.add.circle(x - 9, y + 1, 12, 0x438b4c).setDepth(4);
      this.add.circle(x + 9, y + 1, 12, 0x4b9652).setDepth(4);
      this.add.rectangle(x - 6, y - 10, 5, 5, 0x78b86b).setDepth(5);
    });
    // Lamps
    [250, 570, 890].forEach((x) => {
      this.add.rectangle(x, 260, 5, 34, 0x475569).setDepth(4);
      this.add.rectangle(x, 242, 24, 10, 0xfde68a).setStrokeStyle(2, 0x475569).setDepth(5);
      this.add.circle(x, 250, 22, 0xfef3c7, 0.1).setDepth(2);
    });
    // Garden beds
    [[35, 550], [925, 550], [35, 210], [925, 210]].forEach(([x, y]) => {
      this.add.rectangle(x, y, 48, 30, 0x8b5e34).setStrokeStyle(3, 0x5b3a24).setDepth(3);
      for (let i = -1; i <= 1; i++) this.add.circle(x + i * 13, y - 3, 7, 0xe879a8).setDepth(4);
    });
  }

  createCharacters() {
    this.player = this.physics.add.sprite(480, 420, "player-down-0").setDepth(20);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(18, 20).setOffset(7, 13);
    this.player.setData("facing", "down");

    const npcs = [
      { x: 160, y: 265, name: "ครูคอมพิวเตอร์", type: "learning", color: 0x0f766e },
      { x: 480, y: 265, name: "พ่อค้าช่าง", type: "shop", color: 0xb45309 },
      { x: 800, y: 265, name: "หัวหน้าช่าง", type: "mission", color: 0x6d28d9 },
      { x: 650, y: 455, name: "ลูกค้าประจำ", type: "npc-quests", color: 0x0f766e }
    ];
    npcs.forEach((npc) => {
      const sprite = this.physics.add.staticSprite(npc.x, npc.y, "npc").setDepth(15);
      sprite.refreshBody();
      this.add.text(npc.x, npc.y - 34, npc.name, { fontFamily: "sans-serif", fontSize: "11px", color: "#ffffff", backgroundColor: "#1e293b", padding: { x: 5, y: 3 } }).setOrigin(0.5).setDepth(16);
      this.interactables.push({ x: npc.x, y: npc.y + 4, type: npc.type, label: npc.name, description: "กด E เพื่อพูดคุย", isNpc: true });
    });
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,E");
    this.input.keyboard.addCapture(["UP", "DOWN", "LEFT", "RIGHT", "W", "A", "S", "D"]);
  }

  update() {
    if (!this.player?.body) return;
    const body = this.player.body;
    if (this.interior) {
      const speedInside = 125;
      let ix = 0, iy = 0;
      if (this.cursors.left.isDown || this.keys.A.isDown) ix = -1;
      else if (this.cursors.right.isDown || this.keys.D.isDown) ix = 1;
      if (this.cursors.up.isDown || this.keys.W.isDown) iy = -1;
      else if (this.cursors.down.isDown || this.keys.S.isDown) iy = 1;
      body.setVelocity(ix * speedInside, iy * speedInside);
      if (ix && iy) body.velocity.normalize().scale(speedInside);
      this.player.x = Phaser.Math.Clamp(this.player.x, 195, 765);
      this.player.y = Phaser.Math.Clamp(this.player.y, 185, 500);
      const exitDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, 480, 495);
      const nearExit = exitDistance < 78;
      let station = null;
      if (this.interiorType === "learning") {
        station = this.lessonStations
          .map((item) => ({ ...item, distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y) }))
          .filter((item) => item.distance < 62)
          .sort((a, b) => a.distance - b.distance)[0];
      }
      this.interiorHint.setText(nearExit
        ? "กด E หรือคลิกประตู เพื่อออกจากห้องเรียน"
        : station
          ? `กด E เพื่อเรียนรู้: ${station.name} · เดินลงมาที่ประตูเพื่อออก`
          : "WASD / ลูกศร: เดินสำรวจ · เดินไปที่อุปกรณ์แล้วกด E · ประตูทางออกอยู่ด้านล่าง");
      if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
        if (nearExit) {
          this.exitInterior();
          return;
        }
        if (station) this.game.events.emit("game-interact", `lesson-device:${station.id}`);
      }
      return;
    }
    const speed = 145;
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) vx = -1;
    else if (this.cursors.right.isDown || this.keys.D.isDown) vx = 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) vy = -1;
    else if (this.cursors.down.isDown || this.keys.S.isDown) vy = 1;
    body.setVelocity(vx * speed, vy * speed);
    if (vx && vy) body.velocity.normalize().scale(speed);

    if (vx || vy) {
      this.player.setFlipX(vx < 0);
      this.player.y = this.player.y;
    }

    this.nearbyTarget = this.interactables
      .map((item) => ({ ...item, distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y) }))
      .filter((item) => item.distance < 72)
      .sort((a, b) => a.distance - b.distance)[0] || null;

    if (this.nearbyTarget) {
      this.prompt.setText(`กด E : ${this.nearbyTarget.label}`).setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }

    if (this.dialogueOpen) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.closeDialogue();
      body.setVelocity(0, 0);
      return;
    }

    if (vx || vy) {
      let direction = vy < 0 ? "up" : vy > 0 ? "down" : vx < 0 ? "left" : "right";
      this.player.setData("facing", direction);
      this.walkTimer += 1;
      if (this.walkTimer % 9 === 0) this.walkFrame = 1 - this.walkFrame;
      this.player.setTexture(`player-${direction}-${this.walkFrame}`);
    } else {
      this.walkFrame = 0;
      this.player.setTexture(`player-${this.player.getData("facing") || "down"}-0`);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.E) && this.nearbyTarget) {
      const target = this.nearbyTarget;
      if (target.isNpc && target.type === "npc-quests") {
        this.game.events.emit("game-interact", "npc-quests");
        this.showDialogue(target);
      } else if (target.isNpc) this.showDialogue(target);
      else {
        // Classroom entry is handled entirely in the game world; do not open a popup.
        if (target.type !== "learning") this.game.events.emit("game-interact", target.type);
        this.enterInterior(target.type, target.label);
      }
    }
  }

  showDialogue(target) {
    const lines = {
      learning: ["สวัสดี! ยินดีต้อนรับสู่ห้องเรียน", "เรียนรู้อุปกรณ์ต่อพ่วงให้ครบ แล้วทำแบบทดสอบให้ได้ 80% นะ"],
      shop: ["ยินดีต้อนรับสู่ร้านอุปกรณ์!", "เตรียม Screwdriver และอะไหล่ให้พร้อมก่อนรับงานซ่อม"],
      mission: ["ฉันมีงานซ่อมคอมพิวเตอร์ให้คุณ", "ผ่านบทเรียนและเตรียมอุปกรณ์ให้ครบก่อนเริ่มภารกิจ"],
      "npc-quests": ["วันนี้มีงานจากลูกค้าให้ช่วย!", "เปิดหน้าภารกิจ NPC เพื่อรับงานรายวันได้เลย"]
    };
    const message = (lines[target.type] || ["ยินดีต้อนรับ!"] ).join("\n");
    this.dialoguePanel = this.add.rectangle(480, 520, 650, 100, 0x111827, 0.96).setScrollFactor(0).setDepth(1100).setStrokeStyle(3, 0xfbbf24);
    this.dialogueText = this.add.text(175, 488, `${target.label}\n${message}\n[E] ปิดข้อความ`, { fontFamily: "sans-serif", fontSize: "15px", color: "#ffffff", lineSpacing: 5, wordWrap: { width: 600 } }).setScrollFactor(0).setDepth(1101);
    this.dialogueOpen = true;
  }

  closeDialogue() {
    this.dialoguePanel?.destroy();
    this.dialogueText?.destroy();
    this.dialogueOpen = false;
  }

  enterInterior(type, label) {
    if (this.interior) return;
    this.interior = true;
    this.interiorType = type;
    this.outdoorPlayerPosition = { x: this.player.x, y: this.player.y };
    this.player.setPosition(480, 430);
    this.player.body.setVelocity(0, 0);
    this.interiorLayer = this.add.container(0, 0).setDepth(500);
    const room = this.add.graphics();
    room.fillStyle(0x263238).fillRect(155, 105, 650, 440);
    room.fillStyle(type === "learning" ? 0xb8d7e8 : type === "shop" ? 0xd9bd8c : 0xb9a5d4).fillRect(170, 120, 620, 410);
    room.lineStyle(12, 0x754c32).strokeRect(155, 105, 650, 440);
    room.fillStyle(0x8b7355).fillRect(170, 470, 620, 60);
    this.interiorLayer.add(room);
    this.interiorLayer.add(this.add.text(480, 145, label, { fontFamily: "monospace", fontSize: "24px", color: "#172554", fontStyle: "bold" }).setOrigin(0.5));
    if (type === "learning") {
      this.lessonStations = [
        {id:"monitor",name:"จอภาพ",x:245,y:225,icon:"🖥️"},
        {id:"keyboard",name:"แป้นพิมพ์",x:400,y:225,icon:"⌨️"},
        {id:"mouse",name:"เมาส์",x:555,y:225,icon:"🖱️"},
        {id:"printer",name:"เครื่องพิมพ์",x:710,y:225,icon:"🖨️"},
        {id:"scanner",name:"สแกนเนอร์",x:245,y:330,icon:"📠"},
        {id:"speaker",name:"ลำโพง",x:400,y:330,icon:"🔊"},
        {id:"cpu",name:"CPU",x:555,y:330,icon:"🧠"},
        {id:"ram",name:"RAM",x:710,y:330,icon:"🧩"},
        {id:"ssd",name:"SSD",x:245,y:425,icon:"💾"},
        {id:"power_supply",name:"Power Supply",x:400,y:425,icon:"🔌"},
        {id:"heatsink",name:"Heatsink",x:555,y:425,icon:"🌡️"}
      ];
      this.lessonStations.forEach((station) => {
        const desk = this.add.rectangle(station.x, station.y + 24, 130, 62, 0x805333).setStrokeStyle(4, 0x4b2e1b);
        const device = this.add.rectangle(station.x, station.y - 9, 82, 48, 0xe2e8f0).setStrokeStyle(3, 0x334155);
        const icon = this.add.text(station.x, station.y - 10, station.icon, {fontSize:"36px"}).setOrigin(0.5);
        const labelText = this.add.text(station.x, station.y + 62, station.name, {fontFamily:"sans-serif",fontSize:"13px",color:"#172554",backgroundColor:"#fff7d6",padding:{x:7,y:4}}).setOrigin(0.5);
        this.interiorLayer.add([desk, device, icon, labelText]);
        this.interiorLayer.add(this.add.text(station.x + 48, station.y - 38, "E", {fontFamily:"monospace",fontSize:"12px",color:"#422006",fontStyle:"bold"}).setOrigin(0.5));
      });
    } else {
      const props = type === "shop" ? [[330,285,"🧰","เครื่องมือช่าง"],[480,285,"💾","อะไหล่คอมพิวเตอร์"],[630,285,"🔌","อุปกรณ์ไฟฟ้า"]] : [[330,285,"🖥","โต๊ะตรวจเช็ก"],[480,285,"🔧","โต๊ะซ่อม"],[630,285,"📦","ชั้นอะไหล่"]];
      props.forEach(([x,y,icon,name]) => {
        this.interiorLayer.add(this.add.rectangle(x,y+35,112,72,0x6b4f3b).setStrokeStyle(3,0x3b241b));
        this.interiorLayer.add(this.add.text(x,y,icon,{fontSize:"38px"}).setOrigin(0.5));
        this.interiorLayer.add(this.add.text(x,y+83,name,{fontFamily:"sans-serif",fontSize:"12px",color:"#172554",backgroundColor:"#fff7d6",padding:{x:5,y:3}}).setOrigin(0.5));
      });
    }
    this.exitDoor = this.add.rectangle(480, 495, 170, 38, 0x166534)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.exitDoor.on("pointerdown", () => {
      if (this.interior) this.exitInterior();
    });
    this.interiorLayer.add(this.exitDoor);
    this.interiorLayer.add(this.add.text(480, 495, "🚪 ประตูทางออก", { fontFamily: "monospace", fontSize: "14px", color: "#ffffff" }).setOrigin(0.5));
    this.interiorHint = this.add.text(480, 575, type === "learning" ? "สำรวจอุปกรณ์ทั้ง 11 จุด แล้วกด E เพื่ออ่านบทเรียนและทำแบบทดสอบ · ประตูอยู่ด้านล่าง" : "คุณอยู่ภายในอาคาร · เดินไปที่ประตูแล้วกด E เพื่อออก", { fontFamily: "sans-serif", fontSize: "13px", color: "#ffffff", backgroundColor: "#172554", padding: { x: 10, y: 7 }, align:"center" }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    this.player.setDepth(600);
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(480, 320);
  }

  exitInterior() {
    this.interiorLayer?.destroy(true);
    this.interiorHint?.destroy();
    this.exitDoor?.removeAllListeners();
    this.exitDoor?.destroy();
    this.exitDoor = null;
    this.interior = false;
    this.interiorType = null;
    this.lessonStations = [];
    this.player.setPosition(this.outdoorPlayerPosition.x, this.outdoorPlayerPosition.y);
    this.player.setDepth(20);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }
}
