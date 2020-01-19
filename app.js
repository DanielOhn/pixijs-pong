const canvas = document.getElementById('mycanvas');

let type = 'WebGL';
PIXI.settings.SPRITE_MAX_TEXTURES = Math.min(PIXI.settings.SPRITE_MAX_TEXTURES, 16)

if (!PIXI.utils.isWebGLSupported()) {
  type = 'canvas';
}

let _w = window.innerWidth;
let _h = window.innerHeight;

const app = new PIXI.Application({
  view: canvas,
  width: _w, 
  height: _h,
  resolution: window.devicePixelRatio,
  autoDensity: true
});

window.addEventListener('resize', resize);

function resize() {
  _w = window.innerWidth;
  _h = window.innerHeight;

  app.renderer.resize(_w, _h);
}

let loader = PIXI.Loader.shared;
let img;

loader.add('bar', 'bar.png')
  .add('ball', 'ball.png')
  .add ('wall', 'wall.png')
  .on('progress', handleLoaderProgress)
  .on('load', handleLoadAsset)
  .on('error', handleLoaderError)
  .load(setup);


function handleLoaderProgress(loader, resource) {
  console.log(loader.progress + " % loaded");
}

function handleLoadAsset(loader, resource) {
  console.log("Asset Loaded " + resource.name);
}

function handleLoaderError() {
  console.log("load error");
}

function handleLoadComplete() {
  let texture = loader.resources.bar.texture;

  img = new PIXI.Sprite(texture);
  img.anchor.set(.5);

  app.stage.addChild(img);
  app.ticker.add(animate);

  setTimeout(() => {
    img.texture = loader.resources.bar.texture;
  }, 2000);
}

function animate() {
  img.x = app.renderer.screen.width / 2;
  img.y = app.renderer.screen.height / 2;

  img.rotation += 0.1;
}

let player, enemy, ball, wall, playerScore, enemyScore;
let walls = [];
let floors = [];
let up = keyboard('w');
let down = keyboard('s');

function makeWall() {
  let wall_texture = loader.resources.wall.texture;
  let new_wall = new PIXI.Sprite(wall_texture);
  return new_wall;
}

function setup() {
  // Setting Resources and Main Container
  let stage = new PIXI.Container();
  app.stage.addChild(stage);

  let bar_texture = loader.resources.bar.texture;
  let ball_texture = loader.resources.ball.texture;

  // Setting up Sprites
  player = new PIXI.Sprite(bar_texture);
  stage.addChild(player);

  enemy = new PIXI.Sprite(bar_texture);
  stage.addChild(enemy);

  enemy.interactive = true;
  enemy.hitArea = new PIXI.Rectangle(enemy.x, enemy.y, enemy.width, player.height);
  
  ball = new PIXI.Sprite(ball_texture);
  stage.addChild(ball);

  // Setting up the walls
  for (let i = 0; i < 75; i++) {
    walls.push(makeWall());
    stage.addChild(walls[i]);

    walls[i].y = -200;
    walls[i].x =  i * 8;

    walls[i].anchor.set(.5);

    walls[i].hitArea = new PIXI.Rectangle(walls[i].x, walls[i].y, 8, 8);

    floors.push(makeWall());
    stage.addChild(floors[i]);

    floors[i].y = 200;
    floors[i].x = i * 8;
  }

  // Starting Positions 
  stage.x = app.screen.width / 2;
  stage.y = app.screen.height;

  stage.pivot.x = stage.width / 2;
  stage.pivot.y = stage.height;

  player.x = 0;
  ball.x = 300;
  enemy.x = 600;

  // Setting the speed for player, enemy, ball
  player.vy = 0
  enemy.vy = 0;

  ball.vx = -1;
  ball.vy = 1;

  // Score
  enemy.score = 0;
  player.score = 0;

  const style = new PIXI.TextStyle({
    fontFamily: 'Roboto',
    fill: ['#ffffff'],
    fontSize: 32,
  })

  playerScore = new PIXI.Text(player.score, style);
  enemyScore = new PIXI.Text(enemy.score, style);

  stage.addChild(playerScore);
  stage.addChild(enemyScore);

  playerScore.y = -250;
  playerScore.x = 0;

  enemyScore.y = -250;
  enemyScore.x = 575;

  // Setting anchor to center of each object
  player.anchor.set(.5);
  enemy.anchor.set(.5);
  ball.anchor.set(.5);

  // Controls
  up.press = () => {
    player.vy = 1
  };

  up.release = () => {
    player.vy  = 0;
  };

  down.press = () => {
    player.vy = -1;
  };

  down.release = () => {
    player.vy = 0;
  };

  app.ticker.add(delta => game(delta));
}

function game(delta) {
  let speed = 2.5 * delta;
  let ball_speed = 3 * delta;

  // Makes enemy bar follow the ball
  follow(enemy, ball);

  // Collision for walls
  for (let wall of walls) {
    if (check_collid(player, wall)) {
      if (player.vy > 0) {
        player.vy = 0;
      }
    }

    if (check_collid(enemy, wall)) {
      if (enemy.vy > 0) {
        enemy.vy = 0;
      }
    }

    if (check_collid(ball, wall)) {
      ball.vy = -1;
    }
  }

  for (let floor of floors) {
    if (check_collid(player, floor)) {
      if (player.vy < 0) {
        player.vy = 0;
      }
    }

    if (check_collid(enemy, floor)) {
      if (enemy.vy < 0) {
        enemy.vy = 0;
      }
    }

    if (check_collid(ball, floor)) {
      ball.vy = 1;
    }
  }

  // Collision for ball
  if (check_collid(ball, enemy)) {
    ball.vx = -1;
  }

  if (check_collid(ball, player)) {
    ball.vx = 1;
  }

  // Making objects move
  ball.x += ball.vx * ball_speed;
  ball.y -= ball.vy * ball_speed;
  player.y -= player.vy * speed;
  enemy.y -= enemy.vy * speed;

  // Check if ball is out of bounds and resets it
  if (ball.x < -75) {
    enemy.score += 1;
    enemyScore.text = enemy.score;
    reset_ball()
  } else if (ball.x > 675) {
    player.score += 1;
    playerScore.text = player.score;
    reset_ball();
  }
}

function follow(obj_one, obj_two) {
  if (obj_one.y > obj_two.y) {
    obj_one.vy = 1;
  } else if (obj_one.y < obj_two.y) {
    obj_one.vy = -1;
  } else {
    obj_one.vy = 0;
  }
}

function reset_ball() {
  ball.x = 300;
  ball.y = 0;
}

function check_collid(r1, r2) {
  // Define variables we'll use to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  // hit will determine whether there's a collision
  hit = false;

  // Find the center points of each sprite
  r1.centerX = r1.x;
  r1.centerY = r1.y;

  r2.centerX = r2.x;
  r2.centerY = r2.y;

  // Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  // Calculate the distance vectors between sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  // Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  // Check collision on x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    // A collisoin might be occuring.  Check for it on y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      // There's definitely a collision happening
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }

  return hit;
}

// keyboard stuff
function keyboard(value) {
  let key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;

  key.downHandler = event => {
    if (event.key === key.value) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  key.upHandler = event => {
    if (event.key === key.value) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  // Attach Event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);

  window.addEventListener("keydown", downListener, false);
  window.addEventListener("keyup", upListener, false);

  // Detach event listeners
  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };

  return key;
};
