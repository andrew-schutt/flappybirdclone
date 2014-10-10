// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

// Creates a new 'main' state that will contain the game
var mainState = {

    // Function called first to load all the assets
    preload: function() { 
        // Change the background color of the game
        game.stage.backgroundColor = '#71c5cf';

        // Load the bird sprite
        game.load.image('bird', 'assets/bird.png');  

        // Load the pipe sprite
        game.load.image('pipe', 'assets/pipe.png');   
        
        // Load jump sound
        game.load.audio('jump', 'assets/jump.wav');
    },

    // Fuction called after 'preload' to setup the game 
    create: function() { 
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the bird on the screen
        this.bird = this.game.add.sprite(100, 245, 'bird');
        
        // Add gravity to the bird to make it fall
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000; 

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this); 

        // Create a group of 20 pipes
        this.pipes = game.add.group();
        this.pipes.enableBody = true;
        this.pipes.createMultiple(20, 'pipe');  

        // Timer that calls 'addRowOfPipes' ever 1.5 seconds
        this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);           

        // Add a score label on the top left of the screen
        this.score = 0;
        this.labelScore = this.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });  
        
        // Change the bird sprite center of gravity
        this.bird.anchor.setTo(-0.2, 0.5);
        
        // Add sound for jump
        this.jumpSound = game.add.audio('jump');
    },

    // This function is called 60 times per second
    update: function() {
        // If the bird is out of the world (too high or too low), call the 'restartGame' function
        if (this.bird.inWorld == false)
            this.restartGame(); 

        // If the bird overlap any pipes, call 'restartGame'
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        if (this.bird.angle < 20)
            this.bird.angle += 1;
    },

    // Make the bird jump 
    jump: function() {
        // Check if bird is alive
        if (this.bird.alive === false)
            return;
        
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
        game.add.tween(this.bird).to({angle: -20}, 100).start();
        
        // Jump sound
        this.jumpSound.play();
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },
    
    // If bird hits pipe
    hitPipe: function() {
        // If the bird has already hit a pipe, we have nothing to do
        if (this.bird.alive === false)
            return;
        
        // Set the alive property of the bird to false
        this.bird.alive = false;
        
        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);
        
        // Go through all the pipes, and stop their movement
        this.pipes.forEachAlive(function(p) {
            p.body.velocity.x = 0;
        }, this);
    },

    // Add a pipe on the screen
    addOnePipe: function(x, y) {
        // Get the first dead pipe of our group
        var pipe = this.pipes.getFirstDead();

        // Set the new position of the pipe
        pipe.reset(x, y);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200; 
               
        // Kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    // Add a row of 6 pipes with a hole somewhere in the middle
    addRowOfPipes: function() {
        var hole = Math.floor(Math.random()*5)+1;
        
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole +1) 
                this.addOnePipe(400, i*60+10);   
    
        this.score += 1;
        this.labelScore.text = this.score;  
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main'); 