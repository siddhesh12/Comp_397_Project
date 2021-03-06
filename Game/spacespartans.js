const SCORE_BOARD_HEIGHT = 50;
const FPS = 60;

// Main objects
var spaceShip;
var spaceShipLasers = new createjs.Container();
var spaceShipRockets = new createjs.Container();
var enemyLasers = [];
var enemyShips = new createjs.Container();

// Game Variables
var lives = 2;
var score = 0;
var level = 0;
var shipSpeed = 3;
var laserPower = 30;
var rocketPower = 100;

var lightenemyinterval = 2000;
var heavyenemyinterval = 13000;
var lightenemyspeed = 1;
var heavyenemyspeed = .3;
var lightenemyhp = 100;
var heavyenemyhp = 300;
var bossenemyhp = 1000;
var lightenemypoint = 10;
var heavyenemypoint = 30;
var bossenemypoint = 200;

// Control constants
const ARROW_KEY_LEFT = 37;
const ARROW_KEY_RIGHT = 39;
const ARROW_KEY_UP = 38;
const ARROW_KEY_DOWN = 40;
const LASER_KEY_DOWN = 86; // v
const BOMB_KEY_DOWN = 66;  // b
const SPACE_KEY = 32;
var leftKeyDown = false;
var rightKeyDown = false;
var upKeyDown = false;
var downKeyDown = false;
var laserKeyDown = false;
var bombKeyDown = false;

var canvas, stage, board, scoreTxt, livesTxt, messageTxt, messageInterval;

var gameRunning = true;

// PreLoad variables
var queue;
var startText, instructionText;
var spriteSheet;
var back_001;
var backgroundSong;
var bulletSong;

// Color effect
var filter = new createjs.ColorFilter(1,1,1,1,0,0,0,0);
var redfilter = new createjs.ColorFilter(1,.3,.3,1,0,0,0,0);

function init() {
    canvas = document.getElementById('canvas');
    stage = new createjs.Stage(canvas);
    loadAssets();
    loadSpriteSheet();
    newGame();
}
function newGame() {
    //stage.update();
    buildMessageBoard();
    setControls();
    newLevel();
    startGame();
    playBackgroundMusic();
    stage.removeChild(startText);
    stage.removeChild(instructionText);
}


function playBackgroundMusic()
{
     backgroundSong = createjs.Sound.play('backgroundMusic');
}
function stopBackgroundMusic()
{
     backgroundSong.stop();
     //backgroundSong = null;
}
function playBulletMusic()
{
    bulletSong =  createjs.Sound.play('bulletSound');
}
function playDoubleBulletMusic()
{
    createjs.Sound.play('doubleBulletSound');
    //createjs.Sound.play('doubleBulletSound');
}



// Asset Load Functions
function loadAssets(){

    createjs.Sound.initializeDefaultPlugins();

    queue = new createjs.LoadQueue(true);
    createjs.Sound.alternateExtensions = ["mp3"];
    queue.installPlugin(createjs.Sound);
    queue.loadManifest("./manifest.json");
    queue.on("fileload", handleFileLoad);
    queue.on("complete", loadComplete);
    queue.load();
    console.log("Assets Loaded...");
}
function handleFileLoad(event) {
    if(event.item.id == "spaceShip-001"){
        spaceShip = new createjs.Bitmap(event.result);
    }
    if(event.item.id == "enemy-001"){
        enemy_001 = new createjs.Bitmap(event.result);
    }
    if(event.item.id == "enemy-002"){
        enemy_002 = new createjs.Bitmap(event.result);
    }
    if(event.item.id == "enemy-003"){
        enemy_003 = new createjs.Bitmap(event.result);
    }
    if(event.item.id == "laser-001"){
        laser_001 = new createjs.Bitmap(event.result);
    }
    if(event.item.id == "back-001"){
        back_001 = new createjs.Bitmap(event.result);
        back_001.y = stage.canvas.height - back_001.getBounds().height;
    }
}
function loadComplete(event){
    startText = new createjs.Text("Click To Start", "50px Arial", "#FFFFFF");
    startText.x = canvas.width /2 - startText.getMeasuredWidth()/2;
    startText.y = canvas.height /2 - startText.getMeasuredHeight()/2;

    instructionText = new createjs.Text("Arrows: Direction\nV: Laser\nB: Rockets", "22px Arial", "#FFFFFF");
    instructionText.x = canvas.width /2 - instructionText.getMeasuredWidth()/4  ;
    instructionText.y = startText.y + 70;
    stage.addChild(startText);
    stage.addChild(instructionText);
    stage.update();
    stage.on("stagemousedown",newGame,null,true);
}

function init() {
    canvas = document.getElementById('canvas');
    stage = new createjs.Stage(canvas);
    loadAssets();
    loadSpriteSheet();
    //newGame();
}
function newGame() {
    console.log("Run")
    stage.update();
    setControls();
    newLevel();
    startGame();
    stage.removeChild(startText);
    stage.removeChild(instructionText);
}

// Game and Scene Functions
function buildMessageBoard() {
    board = new createjs.Shape();
    board.graphics.beginFill('#333');
    board.graphics.drawRect(0, 0, canvas.width, SCORE_BOARD_HEIGHT);
    board.y = canvas.height - SCORE_BOARD_HEIGHT;
    stage.addChild(board);
    livesTxt = new createjs.Text('lives: ' + lives, '20px Times', '#fff');
    livesTxt.y = board.y + 10;
    livesTxt.x = 10;
    stage.addChild(livesTxt);
    scoreTxt = new createjs.Text('score: ' + score, '20px Times', '#fff');
    scoreTxt.textAlign = "right";
    scoreTxt.y = board.y + 10;
    scoreTxt.x = canvas.width - 10;
    stage.addChild(scoreTxt);
    messageTxt = new createjs.Text('press spacebar to pause', '18px Times', '#fff');
    messageTxt.textAlign = 'center';
    messageTxt.y = board.y + 10;
    messageTxt.x = canvas.width / 2;
    stage.addChild(messageTxt);
}
function gameOver() {
    createjs.Ticker.setPaused(true);
    gameRunning = false;
    messageTxt.text = "press spacebar to try again";
    createjs.Sound.play('laugh');

    enemyShips.removeAllChildren();
    stage.removeChild(back_001);
    stage.removeChild(spaceShipLasers);
    stage.removeChild(spaceShipRockets);
    stage.removeChild(enemyShips);
    stage.removeChild(spaceShip);
    stopBackgroundMusic();

    gameOverTxt = new createjs.Text('Game Over. Mankind was erased...', '50px Times', '#fff');
    gameOverTxt.textAlign = "center";
    gameOverTxt.y = stage.canvas.height / 2 - 100;
    gameOverTxt.x = stage.canvas.width / 2;
    stage.addChild(gameOverTxt);

    stage.update();
    messageInterval = setInterval(function () {
        messageTxt.visible = messageTxt.visible ? false : true;
        stage.update();
    }, 1000);
}
function resetGame() {
    clearInterval(messageInterval);
    level = 0;
    score = 0;
    lives = 5;
    messageTxt.visible = true;
    gameRunning = true;
    messageTxt.text = "press spacebar to pause";
    stage.update();
    stopBackgroundMusic();
    newLevel();
    createjs.Ticker.setPaused(false);
}
function startGame() {
    createjs.Ticker.setFPS(FPS);
    createjs.Ticker.addEventListener("tick", function (e) {
        if (!e.paused) {
            runGame();
            stage.update();

        }
    });
}
function runGame() {
    if (gameRunning == true) {
        update();
        evalGame();
    }
}

// Render Functions
function newLevel() {
    stage.addChild(back_001);
    stage.addChild(spaceShipLasers);
    stage.addChild(spaceShipRockets);
    stage.addChild(enemyShips);

    buildMessageBoard();
    buildSpaceShip();
    playBackgroundMusic();


    setInterval('buildEnemyShipLight()', lightenemyinterval);
    setInterval('buildEnemyShipHeavy()', heavyenemyinterval);
    setInterval('updateBackground()', 50);
}
function evalGame() {
    /*if (lives < 0 || bricks[0].y > board.y) {
     gameOver();
     }
     if (paddleHits === PADDLE_HITS_FOR_NEW_LEVEL) {
     newLevel();
     }*/
}
// Control Ship Functions
function setControls() {
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;
}
function handleKeyDown(e) {
    e = !e ? window.event : e;
    switch (e.keyCode) {
        case ARROW_KEY_LEFT:
            leftKeyDown = true;
            break;
        case ARROW_KEY_RIGHT:
            rightKeyDown = true;
            break;
        case ARROW_KEY_UP:
            upKeyDown = true;
            break;
        case ARROW_KEY_DOWN:
            downKeyDown = true;
            break;
        case LASER_KEY_DOWN:
            //laserKeyDown = true;
            buildLaser();
            break;
        case BOMB_KEY_DOWN:
            buildRocket();
            break;
    }
}
function handleKeyUp(e) {
    e = !e ? window.event : e;
    switch (e.keyCode) {
        case ARROW_KEY_LEFT:
            leftKeyDown = false;
            break;
        case ARROW_KEY_RIGHT:
            rightKeyDown = false;
            break;
        case ARROW_KEY_UP:
            upKeyDown = false;
            break;
        case ARROW_KEY_DOWN:
            downKeyDown = false;
            break;
        case LASER_KEY_DOWN:
            laserKeyDown = false;
            break;
        case BOMB_KEY_DOWN:
            bombKeyDown = false;
            break;
        case SPACE_KEY:
            if (gameRunning) {
                createjs.Ticker.setPaused(createjs.Ticker.getPaused() ? false : true);
                if(backgroundSong != null)
                {
                    stopBackgroundMusic();
                }
                else
                {
                    playBackgroundMusic();
                }
            }
            else {
                resetGame();
            }
            break;
    }
}

function resetSpaceShip(){
    spaceShip.x = canvas.width / 2 - spaceShip.getBounds().width /  2;
    spaceShip.y = canvas.height - spaceShip.getBounds().height;
}
function buildSpaceShip(){
    resetSpaceShip();
    stage.addChild(spaceShip);
    console.log(spaceShip);
}
function buildEnemyShipLight(){
    enemyShip = new Enemy("light");
    enemyShip.x = getRandomInt(0, stage.canvas.width - enemyShip.getBounds().width);
    enemyShip.y = 0;
    enemyShips.addChild(enemyShip);
}
function buildEnemyShipHeavy(){
    enemyShip = new Enemy("heavy");
    enemyShip.x = getRandomInt(0, stage.canvas.width - enemyShip.getBounds().width);
    enemyShip.y = 0;
    enemyShips.addChild(enemyShip);
}
function buildBoss(){}


// Bullet Functions
function buildLaser(){
    laser = new Laser();
    laser.x = spaceShip.x + spaceShip.getBounds().width / 2;
    laser.y = spaceShip.y;
playBulletMusic();
    spaceShipLasers.addChild(laser);
}
function buildRocket(){
    rocket1 = new Rocket();
    rocket2 = new Rocket();
    rocket1.x = spaceShip.x + 10;
    rocket2.x = spaceShip.x + spaceShip.getBounds().width - 10;
    rocket1.y = spaceShip.y;
    rocket2.y = spaceShip.y;
    playDoubleBulletMusic();
    spaceShipRockets.addChild(rocket1);
    spaceShipRockets.addChild(rocket2);
}
function updateLaser(){
    for(var i = spaceShipLasers.children.length - 1; i >= 0; --i){
        if (spaceShipLasers.children[i].y > 0 && spaceShipLasers.children[i].shouldDie == false){
            spaceShipLasers.children[i].move();
        }
        else{
            spaceShipLasers.removeChildAt(i);
        }
    }
}
function updateRocket(){
    for(var i = spaceShipRockets.children.length - 1; i >= 0; --i){
        if (spaceShipRockets.children[i].y > 0 && spaceShipRockets.children[i].shouldDie == false){
            spaceShipRockets.children[i].move();
        }
        else{
            spaceShipRockets.removeChildAt(i);
        }
    }
}


// Update Functions
function update() {
        checkShip();
        updateShip();
        updateLaser();
        updateRocket();
        updateEnemies();
        updateBoard();

}
function updateShip(){

    if(leftKeyDown) {
        if (spaceShip.x > 0) {
            spaceShip.x -= shipSpeed
        }
    }
    if(rightKeyDown) {
        if (spaceShip.x < canvas.width - spaceShip.getBounds().width) {
            spaceShip.x += shipSpeed
        }
    }
    if(upKeyDown) {
        if (spaceShip.y > 0) {
            spaceShip.y -= shipSpeed
        }
    }
    if(downKeyDown) {
        if (spaceShip.y < canvas.height - spaceShip.getBounds().height) {
            spaceShip.y += shipSpeed
        }
    }

    if(laserKeyDown){
        console.log(spaceShipLasers.length);
        buildLaser();
    }

    if(bombKeyDown){
        console.log("fireBomb");
        //fireLaser();
    }
}
function updateEnemies(){
    for(var i = enemyShips.children.length - 1; i >= 0; --i){
        if (enemyShips.children[i].y < stage.canvas.width && enemyShips.children[i].hp > 0){
            enemyShips.children[i].move();
            // Process the laser hits
            for(var j = spaceShipLasers.children.length - 1; j >=0; --j){
                //console.log(spaceShipLasers.children[lser].y);
                if(spaceShipLasers.children[j].x >= enemyShips.children[i].x &&
                    spaceShipLasers.children[j].x + spaceShipLasers.children[j].getBounds().width < enemyShips.children[i].x + enemyShips.children[i].getBounds().width &&
                    spaceShipLasers.children[j].y < enemyShips.children[i].y + enemyShips.children[i].getBounds().height){

                    spaceShipLasers.removeChildAt(j);
                    enemyShips.children[i].hp -= laserPower;

                    //Apply color effect animation
                    /*enemyShips.children[i].filters = [filter];
                    var tween = createjs.Tween.get(enemyShips.children[i])
                        .to({filters:[redfilter]}, 500, createjs.Ease.getPowInOut(4))
                        .wait(200)
                        .to({filters:[filter]}, 500, createjs.Ease.getPowInOut(4));

                    enemyShips.children[i].cache(0,0,enemyShips.children[i].getBounds().width,enemyShips.children[i].getBounds().height);
                    enemyShips.children[i].updateCache();*/

                    // Play hit laser here
                    //console.log("Laser Hit Test Ok");
                }
            }

            // Process the rocket hits
            for(var j = spaceShipRockets.children.length - 1; j >=0; --j){
               if(checkCollision(spaceShipRockets.children[j], enemyShips.children[i] )){
                    spaceShipRockets.removeChildAt(j);
                    enemyShips.children[i].hp -= rocketPower;

                    // Play hit laser here
                    //console.log("Rocket Hit Test Ok");
                }
            }

            if(enemyShips.children[i].enemytype == "light") {
                if(enemyShips.children[i].hp < (lightenemyhp * .5)) {
                    enemyShips.children[i].filters = [
                        new createjs.ColorFilter(1,.3,.3,1,0,0,0,0)
                    ];
                    enemyShips.children[i].cache(0,0,enemyShips.children[i].getBounds().width,enemyShips.children[i].getBounds().height);
                    enemyShips.children[i].updateCache();
                }
            }
            if(enemyShips.children[i].enemytype == "heavy") {
                if(enemyShips.children[i].hp < (heavyenemyhp * .5)) {
                    enemyShips.children[i].filters = [
                        new createjs.ColorFilter(1,.3,.3,1,0,0,0,0)
                    ];
                    enemyShips.children[i].cache(0,0,enemyShips.children[i].getBounds().width,enemyShips.children[i].getBounds().height);
                    enemyShips.children[i].updateCache();
                }
            }

        }
        else{
            // Play explosion in this position
            // Play explosion sound

            switch (enemyShips.children[i].enemytype){
                case "light":
                    score += lightenemypoint;
                    break;
                case "heavy":
                    score += heavyenemypoint;
                    break;
                case "boss":
                    score += bossenemypoint;
                    break;
            }
            createjs.Sound.play('explosion');
            enemyShips.removeChildAt(i);
            console.log(score);
        }
    }
}
function updateBoss(){}
function updateBackground(){
    // console.log(back_001.y);
    if(back_001.y <= 0){
        back_001.y += .3;
    }
}

function updateBoard(){
    livesTxt.text = "lives: " + lives;
    scoreTxt.text = "score: " + score;
}

function checkShip(){
    for(var i = enemyShips.children.length - 1; i >= 0; --i){
        if (checkCollision(spaceShip, enemyShips.children[i])){

            enemyShips.removeChildAt(i);
            createjs.Sound.play('explosion');
            // explosion
            lives -= 1;

            if(lives > 0 ){
                resetSpaceShip();
            } else {
                gameOver();
            }
        }
    }
}
function checkEnemies(){}
function checkBoss(){}


// Laser Class
function Laser() {
    this.initialize();
    this.speed = -5;
    this.nextY = null;
    this.shouldDie = false;
}
Laser.prototype = new createjs.Sprite();
Laser.prototype.Sprite_initialize = Laser.prototype.initialize;
Laser.prototype.initialize = function () {
    // console.log("initializing" + spriteSheet);
    this.Sprite_initialize(spriteSheet, "stone_1");
    this.paused = true;
    playBulletMusic();
}
Laser.prototype.move = function (){
    //console.log("moving...");
    this.y += this.speed;
}

// Rocket Class
function Rocket() {
    this.initialize();
    this.speed = -2;
    this.nextY = null;
    this.shouldDie = false;
}
Rocket.prototype = new createjs.Sprite();
Rocket.prototype.Sprite_initialize = Rocket.prototype.initialize;
Rocket.prototype.initialize = function () {
    this.Sprite_initialize(spriteSheet, "stone_2");
    this.paused = true;
}
Rocket.prototype.move = function (){
    this.y += this.speed;
}

// Enemy 001 Class
function Enemy(enemytype) {
    this.shouldDie = false;
    this.enemytype = enemytype;
    switch (enemytype){
        case "light":
            this.sprite = "enemy-001";
            this.speed = lightenemyspeed;
            this.hp = lightenemyhp;
            break;
        case "heavy":
            this.sprite = "enemy-002";
            this.speed = heavyenemyspeed;
            this.hp = heavyenemyhp;
            break;
        case "boss":
            this.sprite = "enemy-003";
            this.hp = bossenemyhp;
            this.speed = 0;
            break;
    }
    this.initialize();

}
Enemy.prototype = new createjs.Sprite();
Enemy.prototype.Sprite_initialize = Enemy.prototype.initialize;
Enemy.prototype.initialize = function () {
    this.Sprite_initialize(spriteSheet, this.sprite);
    this.paused = true;
}
Enemy.prototype.move = function (){
    this.y += this.speed;
}


function checkCollision(shape1, shape2){
    if(shape1.x >= shape2.x &&
        shape1.x + shape1.getBounds().width < shape2.x + shape2.getBounds().width &&
        shape1.y < shape2.y + shape2.getBounds().height){
        return true
    }

    return false;

}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadSpriteSheet() {
    var data = {
        "images": ["images/frankala.png"],
        "frames": [
            [2, 2, 903, 331],
            [826, 409, 59, 51],
            [356, 335, 117, 150],
            [588, 335, 117, 133],
            [707, 335, 117, 124],
            [2, 335, 118, 170],
            [239, 335, 115, 152],
            [122, 335, 115, 142],
            [475, 335, 111, 146],
            [826, 335, 75, 72],
            [142, 479, 16, 25],
            [122, 482, 18, 22],
            [160, 482, 18, 19],
            [907, 242, 127, 238],
            [907, 2, 127, 238]
        ],
        "animations": {
            "board": [0],
            "bubble": [1],
            "face": [2],
            "enemy-001": [3],
            "enemy-003": [4],
            "cpu1": [5],
            "cpu2": [6],
            "cpu3": [7],
            "enemy-002": [8],
            "scoreBrick": [9],
            "stone_0": [10],
            "stone_1": [11],
            "stone_2": [12],
            "stone_3": [13],
            "window": [14],
            "windowOn": [15]
        }
    };
    spriteSheet = new createjs.SpriteSheet(data);
    var frank = new createjs.Sprite(spriteSheet, 'stone_1');
    stage.addChild(frank);
}