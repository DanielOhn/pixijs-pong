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

loader.add('bar', 'bar.png')
  .add('ball', 'ball.png')
  .on('progress', handleLoaderProgress)
  .on('load', handleLoadAsset)
  .on('error', handleLoaderError)
  .load(setup);

let img;

let player, enemy, ball;

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

  // Starting Positions 
  stage.x = app.screen.width / 2;
  stage.y = app.screen.height / 2;

  stage.pivot.x = stage.width / 2;
  stage.pivot.y = stage.height / 2;

  player.x = -300;
  enemy.x = 300;
  // Controls

  app.ticker.add(delta => game(delta));
}

function game(delta) {
  let speed = 3 * delta;
  ball.x += 1 * delta;
}