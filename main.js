// ----- Start of the assigment ----- //
class ParticleSystem extends PIXI.Container {
  //   Optional parameter is added as the duration of animation might be dependent on some external value, allowing for greater flexibility and control over the effect.
  constructor(duration) {
    super();
    // Set start and duration for this effect in milliseconds
    this.start = 0;
    this.duration = duration || 6000; // If there is no duration provided default duration value is set to 6000ms
    // Create a sprite
    let sp = game.sprite("CoinsGold000");
    // Set pivot to center of the sprite
    sp.pivot.x = sp.width / 2;
    sp.pivot.y = sp.height / 2;
    // Add the sprite particle to our particle effect
    this.addChild(sp);
    // Save a reference to the sprite particle
    this.sp = sp;

    // Set the initial position to the center of the container
    this.sp.x = 400;
    this.sp.y = 225;

    // Set the initial scale and alpha values to 0
    this.sp.scale.x = this.sp.scale.y = 0;
    this.sp.alpha = 0;

    // Generate random angle using radians and random speed for the particle
    this.angle = Math.random() * Math.PI * 2;
    this.speed = 100 + Math.random() * 300;
  }

  animTick(nt, lt, gt) {
    // Every update we get three different time variables: nt, lt and gt.
    //   nt: Normalized time in procentage (0.0 to 1.0) and is calculated by
    //       just dividing local time with duration of this effect.
    //   lt: Local time in milliseconds, from 0 to this.duration.
    //   gt: Global time in milliseconds.

    // Set a new texture on a sprite particle
    let num = ("000" + Math.floor(nt * 8)).substr(-3);
    game.setTexture(this.sp, "CoinsGold" + num);

    // Calculate the distance the particle should move based on nt
    let distance = nt * this.speed;

    // Update the position of the particle from center using polar coordinates
    this.sp.x = 400 + Math.cos(this.angle) * distance;
    this.sp.y = 225 + Math.sin(this.angle) * distance;

    // Animate scale
    this.sp.scale.x = this.sp.scale.y = nt;

    // Animate alpha, fade out slowly
    this.sp.alpha = 1 - nt;

    // Animate rotation
    this.sp.rotation = nt * Math.PI * 4;
  }
}

// ----- End of the assigment ----- //

class Game {
  constructor(props) {
    this.totalDuration = 0;
    this.effects = [];
    this.renderer = new PIXI.WebGLRenderer(800, 450);
    document.body.appendChild(this.renderer.view);
    this.stage = new PIXI.Container();
    this.loadAssets(props && props.onload);
  }
  loadAssets(cb) {
    let textureNames = [];
    // Load coin assets
    for (let i = 0; i <= 8; i++) {
      let num = ("000" + i).substr(-3);
      let name = "CoinsGold" + num;
      let url = "gfx/CoinsGold/" + num + ".png";
      textureNames.push(name);
      PIXI.loader.add(name, url);
    }
    PIXI.loader.load(
      function (loader, res) {
        // Access assets by name, not url
        let keys = Object.keys(res);
        for (let i = 0; i < keys.length; i++) {
          var texture = res[keys[i]].texture;
          if (!texture) continue;
          PIXI.utils.TextureCache[keys[i]] = texture;
        }
        // Assets are loaded and ready!
        this.start();
        cb && cb();
      }.bind(this)
    );
  }
  start() {
    this.isRunning = true;
    this.t0 = Date.now();
    update.bind(this)();
    function update() {
      if (!this.isRunning) return;
      this.tick();
      this.render();
      requestAnimationFrame(update.bind(this));
    }
  }
  addEffect(eff) {
    this.totalDuration = Math.max(
      this.totalDuration,
      eff.duration + eff.start || 0
    );
    this.effects.push(eff);
    this.stage.addChild(eff);
  }
  render() {
    this.renderer.render(this.stage);
  }
  tick() {
    let gt = Date.now();
    let lt = (gt - this.t0) % this.totalDuration;
    for (let i = 0; i < this.effects.length; i++) {
      let eff = this.effects[i];
      if (lt > eff.start + eff.duration || lt < eff.start) continue;
      let elt = lt - eff.start;
      let ent = elt / eff.duration;
      eff.animTick(ent, elt, gt);
    }
  }
  sprite(name) {
    return new PIXI.Sprite(PIXI.utils.TextureCache[name]);
  }
  setTexture(sp, name) {
    sp.texture = PIXI.utils.TextureCache[name];
    if (!sp.texture) console.warn("Texture '" + name + "' don't exist!");
  }
}

// Helper function that sets number of coins, interval in which they appear and also the length of the animation
function createParticleSystems(numOfCoins, startInterval, duration) {
  for (let i = 0; i < numOfCoins; i++) {
    // Create a new ParticleSystem instance
    let particleSystem = new ParticleSystem(duration);
    // Set the start time of the ParticleSystem instance based on the index and start interval
    particleSystem.start = i * startInterval;
    // Add the ParticleSystem instance to the game
    game.addEffect(particleSystem);
  }
}

window.onload = function () {
  // Create a new Game instance and set it to the global variable "game"
  window.game = new Game({
    onload: function () {
      // Create 80 coins with a spawn interval of 100ms and animation duration of 6000ms which is also the default value
      createParticleSystems(80, 100, 6000);
    },
  });
};
