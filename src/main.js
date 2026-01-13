import kaboom from "kaboom";
kaboom({ pixelDensity: 1 });

// LOAD SPRITES
loadSprite("snoop1", "/sprites/gd.png");
loadSprite("snoop2", "/sprites/gd.png");
loadSprite("bg", "/sprites/gd-backg.png");
loadSprite("doghouse", "/sprites/doghouse.png");
loadSprite("house", "/sprites/house.png");
loadSprite("ballon", "/sprites/ballon.png");
const frames = ["snoop1", "snoop2"];

console.log(width());

// CONSTANTS 480
const FLOOR_HEIGHT = height() / 15;
const JUMP_FORCE = width() > 1300 ? 650 : 500;
const SPEED = width() > 1300 ? 480 : 150;
const scrollSpeed = 200;

let last = 0;
const targetFPS = 10;
const frameDuration = 1 / targetFPS;
setBackground(254, 244, 230, 255);

scene("game", () => {
  setGravity(1200); // GRAVITY
  onKeyPress("space", jump);
  onClick(jump);

  // BACKGROUND CHANGES
  const background = add([sprite("bg", { height: height() }), pos(0, 0), "bg"]);
  add([sprite("bg", { height: height() }), pos(background.width, 0), "bg"]);
  add([sprite("bg", { height: height() }), pos(background.width * 2, 0), "bg"]);

  // SNOOPY
  const player = add([
    sprite("snoop1", { height: height() / 10 }),
    scale(-1, 1),
    pos(height() / 10 + 50, 100),
    "snoop1",
    area(),
    body(),
  ]);

  //TOP WALL
  add([
    rect(width(), FLOOR_HEIGHT),
    pos(0, height()),
    anchor("botleft"),
    area(),
    body({ isStatic: true }),
    color(77, 11, 11),
  ]);

  //BOTTOM
  add([
    rect(width(), FLOOR_HEIGHT),
    pos(0, 0),
    anchor("topleft"),
    area(),
    body({ isStatic: true }),
    color(77, 11, 11),
  ]);

  function jump() {
    player.jump(JUMP_FORCE);
  }

  function spawnDoghouse() {
    add([
      sprite("doghouse", { height: height() / rand(5, 6.3) }),
      area(),
      pos(width(), height() - FLOOR_HEIGHT),
      anchor("botleft"),
      move(LEFT, SPEED),
      offscreen({ destroy: true }),
      {
        update() {
          if (this.pos.x + this.width < 0) {
            destroy(this);
          }
        },
      },
      "doghouse",
    ]);
  }

  function spawnHouse() {
    add([
      sprite("house", { height: height() / rand(1.9, 3) }),
      area(),
      pos(width(), height() - FLOOR_HEIGHT),
      anchor("botleft"),
      move(LEFT, SPEED),
      {
        update() {
          if (this.pos.x + this.width < 0) {
            destroy(this);
          }
        },
      },
      "house",
    ]);
  }

  function spawnBallon() {
    const ballonHeight = height() / rand(2, 3);

    const minY = FLOOR_HEIGHT + ballonHeight;
    const maxY = height() - FLOOR_HEIGHT;

    const y = rand(minY, maxY);

    add([
      sprite("ballon", { height: ballonHeight }),
      area(),
      pos(width(), y),
      anchor("botleft"),
      move(LEFT, SPEED),
      {
        update() {
          if (this.pos.x + this.width < 0) {
            destroy(this);
          }
        },
      },
      "ballon",
    ]);
  }

  function spawnObsticle() {
    const random = rand(0, 4);

    if (random > 2) {
      spawnBallon();
    } else if (random > 1) {
      spawnHouse();
    } else {
      spawnDoghouse();
    }
  }

  player.onCollide("doghouse", () => {
    go("lose", score);
    addKaboom(player.pos);
  });
  player.onCollide("house", () => {
    go("lose", score);
    addKaboom(player.pos);
  });
  player.onCollide("ballon", () => {
    go("lose", score);
    addKaboom(player.pos);
  });

  let score = 0;
  const scoreLabel = add([
    text(score),
    pos(50, FLOOR_HEIGHT + 50),
    color(0, 0, 0),
  ]);

  let snoop = true;

  onUpdate(() => {
    const now = time();
    if (now - last < frameDuration) return;
    last = now;

    score++;
    scoreLabel.text = score;

    const gameSpeed = width() > 1300 ? 40 : 90;

    if (score % gameSpeed === 0) spawnObsticle();

    // CHANGE SNOOP SPRITE
    if (score % 10 === 0) {
      snoop = !snoop;
      player.use(sprite(frames[snoop ? 0 : 1], { height: height() / 10 }));
    }
  });

  onUpdate("bg", (bg) => {
    bg.move(-scrollSpeed, 0);

    if (bg.pos.x < -background.width) {
      bg.pos.x += background.width * 3;
    }
  });
});

scene("lose", (score) => {
  add([
    sprite("snoop1", { height: height() / 3.5 }),
    pos(width() / 2, height() / 2 - 64),
    anchor("center"),
  ]);

  add([
    text(`Score: ${score}`),
    pos(width() / 2, height() / 2 + 250),
    scale(height() > 1300 ? 2 : 1),
    color(0, 0, 0),
    anchor("center"),
  ]);

  // START AGAIN
  onKeyPress("space", () => go("start"));
  onClick(() => go("start"));
});

scene("start", () => {
  add([
    sprite("snoop1", { height: height() / 3.5 }),
    pos(width() / 2, height() / 2 - 64),
    anchor("center"),
  ]);
  add([
    text("Tap to Start!"),
    pos(width() / 2, height() / 2 + 250),
    scale(height() > 1300 ? 2 : 1),
    color(0, 0, 0),
    anchor("center"),
    "floatingText",
  ]);

  // START AGAIN
  onKeyPress("space", () => go("game"));
  onClick(() => go("game"));
});

go("start");
