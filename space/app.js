// SPACESHIP

var Spaceship = function(pos_x, game) {

  var that = this;
  that.game = game;

  that.SIZE = 30;

  that.pos = {
    x: pos_x,
    y: that.game.CANVAS_SIZE - that.SIZE
  };

  that.draw = function () {
    that.game.ctx.fillStyle = "800080";
    that.game.ctx.fillRect(that.pos.x, that.pos.y, that.SIZE, that.SIZE);
  }
}

// BULLET

var Bullet = function(x_pos, y_pos, direction, game) {

  var that = this;
  that.direction = direction;
  that.game = game;

  that.SPEED = 10;
  that.HEIGHT = 10;
  that.WIDTH = 5;

  that.pos = {
    x: x_pos,
    y: y_pos
  }

  that.update = function() {
    if (direction) {
      that.pos.y -= that.SPEED;
    } else {
      that.pos.y += that.SPEED;
    };
  };

  that.draw = function() {
    that.game.ctx.fillStyle = "CC0066";
    that.game.ctx.fillRect(that.pos.x, that.pos.y, that.WIDTH, that.HEIGHT);
  };
}

//INVADER

var Invader = function(x_pos, y_pos, ctx) {

  var that = this;
  that.direction = true;
  that.ctx = ctx;

  that.VELOCITY = 5;
  that.SIZE = 30;

  that.pos = {
    x: x_pos,
    y: y_pos
  }

  that.update = function() {
    that.pos.x += that.VELOCITY;
    if (that.pos.x > 500) {
      that.pos.x = 0 - that.SIZE;
    };
  }

  that.draw = function() {
    that.ctx.fillStyle = "0F0";
    that.ctx.fillRect(that.pos.x, that.pos.y, that.SIZE, that.SIZE);
  }
}

// GAME

var Game = function(ctx) {

  var that = this;

  that.CANVAS_SIZE = 500;
  that.STEP_SIZE = 5;
  that.INTERVAL_SIZE = 1000/16;

  that.ctx = ctx;
  that.spaceship = new Spaceship(20, that);
  that.intervalID = undefined;
  that.bullet = undefined;
  that.invaders = [];
  that.step_counter = 0
  that.invaderBullets = [];
  that.lives = 3;

  key('left', function() {
    that.spaceship.pos.x -= that.STEP_SIZE;
  });
  key('right', function() {
    that.spaceship.pos.x += that.STEP_SIZE;
  });
  key('up', function() {
    that.fireBullet();
  });

  //starts the game
  that.play = function() {
    that.createInvaders(1);
    that.intervalID = setInterval(that.step, that.INTERVAL_SIZE);
  };

  //update positions on board based on velocity
  that.update = function() {
    if (that.bullet) {
      that.bullet.update();
      if (that.bullet.pos.y < (0 - that.bullet.HEIGHT) ) {
        that.bullet = undefined;
      };
    };
    for (var j = 0; j < that.invaderBullets.length; j++) {
      that.invaderBullets[j].update();
      if (that.invaderBullets[j].pos.y > 500 + that.invaderBullets[j].HEIGHT) {
        that.invaderBullets.splice(j, 1);
      };
    };
    // update each invader
    for (var i = 0; i < that.invaders.length; i++) {
      that.invaders[i].update();
    };
  };

  that.draw = function() {
    if (that.bullet) {
      that.bullet.draw();
    };
    for (var j = 0; j < that.invaderBullets.length; j++) {
      that.invaderBullets[j].draw();
    };
    that.spaceship.draw();
    // draw each invader
    for (var i = 0; i < that.invaders.length; i++) {
      that.invaders[i].draw();
    };
  };

  //the 'game loop'
  that.step = function() {
    $('#life-counter').text("LIVES: " + that.lives);

    if (that.step_counter % 20 == 0) {
      var randomInvaderIndex = Math.floor(Math.random() * (that.invaders.length - 1));
      that.invaderFireBullet(that.invaders[randomInvaderIndex]);
    };

    if (that.step_counter % 400 == 0 && that.step_counter != 0) {
        console.log("Dropping");
      for (var i = 0; i < that.invaders.length; i++) {
        that.invaders[i].pos.y = that.invaders[i].pos.y + 45;
      };
    };

    ctx.clearRect(0, 0, that.CANVAS_SIZE, that.CANVAS_SIZE);
    that.update();

    if (that.bullet) {
      that.bulletHit();
    };

    if (that.spaceshipHit()) {
      that.lives -= 1;
      if (that.lives == 0) {
        $('#life-counter').text("LIVES: " + that.lives);
        alert("You lose!");
        clearInterval(that.intervalID);
      };
    } else if(that.gameOver()) {
      that.lives = 0;
      $('#life-counter').text("LIVES: " + that.lives);
      alert("You lose!");
      clearInterval(that.intervalID);
    };

    that.draw();
    that.step_counter++;
  };


  that.gameOver = function() {
    for(var i=0; i<that.invaders.length; i++) {
      if(that.invaders[i].pos.y > (that.CANVAS_SIZE - that.invaders[i].SIZE - that.spaceship.SIZE)) {
        return true;
      };
    };
  };

  that.fireBullet = function() {
    if (that.bullet == undefined) {
      that.bullet = new Bullet((that.spaceship.pos.x + that.spaceship.SIZE/2 - 2.5), that.spaceship.pos.y, true, that);
    };
  };

  that.invaderFireBullet = function (invader) {
    that.invaderBullets.push(new Bullet((invader.pos.x + invader.SIZE/2 - 2.5), invader.pos.y + invader.SIZE, false, that));
  };

  that.createInvaders = function(n) {
    for (var i = 0; i < n; i++) {
      for (var y = 230; y > 29; y -= 45) {
        for (var x = 50; x < 480; x+= 45) {
          that.invaders.push(new Invader(x, y, that.ctx));
        };
      };
    };
  };

  that.bulletHit = function() {
    for (var i = 0; i < that.invaders.length; i++) {
      //check to see if rectangles intersect
      if (that.bullet.pos.x < that.invaders[i].pos.x + that.invaders[i].SIZE &&
        that.bullet.pos.x + that.bullet.WIDTH > that.invaders[i].pos.x &&
        that.bullet.pos.y < that.invaders[i].pos.y + that.invaders[i].SIZE &&
        that.bullet.pos.y + that.bullet.HEIGHT > that.invaders[i].pos.y) {
        that.invaders.splice(i, 1);
        that.bullet = undefined;
        return true;
      };
    };
  };

  that.spaceshipHit = function() {
    for (var i = 0; i < that.invaderBullets.length; i++) {
      //check if rectangles intersec
      if (that.spaceship.pos.x < that.invaderBullets[i].pos.x + that.invaderBullets[i].WIDTH &&
          that.spaceship.pos.x + that.spaceship.SIZE > that.invaderBullets[i].pos.x &&
          that.spaceship.pos.y < that.invaderBullets[i].pos.y + that.invaderBullets[i].HEIGHT &&
          that.spaceship.pos.y + that.spaceship.SIZE > that.invaderBullets[i].pos.y) {
        that.invaderBullets.splice(i, 1);
        return true;
      }
    }
  }

  //script
  that.play();
}

