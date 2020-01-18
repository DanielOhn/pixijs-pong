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

let player, enemy, ball, wall;
let walls = [];
let floors = [];
let up = keyboard('w');
let down = keyboard('d');


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

  ball = new PIXI.Sprite(ball_texture);
  stage.addChild(ball);

  // wall = new PIXI.Sprite(wall_texture);
  // stage.addChild(wall);

  // wall.y = -200;

  for (let i = 0; i < 75; i++) {
    walls.push(makeWall());
    stage.addChild(walls[i]);

    walls[i].y = -200;
    walls[i].x =  i * 8;

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
  enemy.x = 600;

  player.vy = 0

  player.anchor.set(.5);
  enemy.anchor.set(.5);

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
  let speed = 3 * delta;
  ball.x += 1 * delta;
  
  player.y -= player.vy * speed;
  
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
