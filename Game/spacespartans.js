const WALL_THICKNESS = 20;
const PADDLE_WIDTH = 100;
const PADDLE_SPEED = 16;
const PUCK_SPEED = 5;
const PADDLE_HITS_FOR_NEW_LEVEL = 5;
const SCORE_BOARD_HEIGHT = 50;

const FPS = 60;


var spaceShip, enemy001, enemy002, enemy003, bullet;

// Control constants
const ARROW_KEY_LEFT = 37;
const ARROW_KEY_RIGHT = 39;
const ARROW_KEY_UP = 38;
const ARROW_KEY_DOWN = 40;
const LASER_KEY_DOWN = 86; // v
const BOMB_KEY_DOWN = 66;  // b
const SPACE_KEY = 32;

var LASERPOWER = 30;
var ROCKETPOWER = 100;

var canvas, stage, paddle, puck, board, scoreTxt, livesTxt, messageTxt, messageInterval;


var leftKeyDown = false;
var rightKeyDown = false;
var upKeyDown = false;
var downKeyDown = false;
var laserKeyDown = false;
var bombKeyDown = false;

var shipSpeed = 3;
var lightenemyspeed = 1;
var heavyenemyspeed = .3;
var lightenemyhp = 100;
var heavyenemyhp = 300;
var bossenemyhp = 1000;

var lightenemyinterval = 2000;
var heavyenemyinterval = 13000;


var spaceShipLasers = new createjs.Container();
var spaceShipRockets = new createjs.Container();
var enemyLasers = [];

var enemyShips = new createjs.Container();

var spriteSheet;

var bricks = [];

var paddleHits = 0;
var combo = 0;
var lives = 5;
var score = 0;
var level = 0;
var back_001;

var gameRunning = true;

// PreLoad variables
var queue;
var startText;


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

    stage.removeChild(startText);
}

// Asset Load Functions
function loadAssets(){
    queue = new createjs.LoadQueue(true);
    queue.loadManifest("./manifest.json");
    queue.on("fileload", handleFileLoad);
    queue.on("complete", loadComplete);
    queue.load();
    console.log("Assets Loaded...");
}
function handleFileLoad(event) {
    if(event.item.id == "spaceShip-001"){
        spaceShip = new createjs.Bitmap(event.result);
        spaceShip.x = canvas.width / 2 - spaceShip.getBounds().width /  2;
        spaceShip.y = canvas.height - spaceShip.getBounds().height;
        console.log("SpaceShip loaded...")
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
    stage.addChild(startText);
    stage.update();
    stage.on("stagemousedown",newGame,null,true);
}

// Game and Scene Functions
function buildScene(){

}
function buildMessageBoard() {
    board = new createjs.Shape();
    board.graphics.beginFill('#333');
    board.graphics.drawRect(0, 0, canvas.width, SCORE_BOARD_HEIGHT);
    board.y = canvas.height - SCORE_BOARD_HEIGHT;
    stage.addChild(board);
    livesTxt = new createjs.Text('lives: ' + lives, '20px Times', '#fff');
    livesTxt.y = board.y + 10;
    livesTxt.x = WALL_THICKNESS;
    stage.addChild(livesTxt);
    scoreTxt = new createjs.Text('score: ' + score, '20px Times', '#fff');
    scoreTxt.textAlign = "right";
    scoreTxt.y = board.y + 10;
    scoreTxt.x = canvas.width - WALL_THICKNESS;
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
    messageTxt.text = "press spacebar to play";
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
    paddleHits = 0;
    puck.y = 160;
    puck.vely = PUCK_SPEED;
    puck.visible = true;
    paddle.visible = true;
    messageTxt.visible = true;
    gameRunning = true;
    messageTxt.text = "press spacebar to pause";
    stage.update();
    removeBricks();
    newLevel();
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
    update();
    evalGame();
}


// Control Ship Functions
function setControls() {
    console.log("... moving ...")
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
            }
            else {
                resetGame();
            }
            break;
    }
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

    spaceShipLasers.addChild(laser);
}
function buildRocket(){
    rocket1 = new Rocket();
    rocket2 = new Rocket();
    rocket1.x = spaceShip.x + 10;
    rocket2.x = spaceShip.x + spaceShip.getBounds().width - 10;
    rocket1.y = spaceShip.y;
    rocket2.y = spaceShip.y;

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
    updateShip();
    updateLaser();
    updateRocket();
    updateEnemies();
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
                    enemyShips.children[i].hp -= LASERPOWER;

                    // Play hit laser here
                    //console.log("Laser Hit Test Ok");
                }
            }

            // Process the rocket hits
            for(var j = spaceShipRockets.children.length - 1; j >=0; --j){
                //console.log(spaceShipLasers.children[lser].y);
                if(spaceShipRockets.children[j].x >= enemyShips.children[i].x &&
                    spaceShipRockets.children[j].x + spaceShipRockets.children[j].getBounds().width < enemyShips.children[i].x + enemyShips.children[i].getBounds().width &&
                    spaceShipRockets.children[j].y < enemyShips.children[i].y + enemyShips.children[i].getBounds().height){

                    spaceShipRockets.removeChildAt(j);
                    enemyShips.children[i].hp -= ROCKETPOWER;

                    // Play hit laser here
                    //console.log("Rocket Hit Test Ok");
                }
            }

            if(enemyShips.children[i].enemytype =="light") {
                if(enemyShips.children[i].hp < (lightenemyhp * .5)) {
                    enemyShips.children[i].filters = [
                        new createjs.ColorFilter(1,.3,.3,1,0,0,0,0)
                    ];
                    enemyShips.children[i].cache(0,0,enemyShips.children[i].getBounds().width,enemyShips.children[i].getBounds().height);
                    enemyShips.children[i].updateCache();
                }
            }
            if(enemyShips.children[i].enemytype =="heavy") {
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
            // console.log(enemyShips.children[i].hp);
            console.log(enemyShips.children[i].enemytype);
            enemyShips.removeChildAt(i);
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

function checkShip(){

}
function checkEnemies(){

}
function checkBoss(){}

// Render Functions
function newLevel() {
    stage.addChild(back_001);
    stage.addChild(spaceShip);
    stage.addChild(spaceShipLasers);
    stage.addChild(spaceShipRockets);
    stage.addChild(enemyShips);


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


// Laser Class
function Laser() {
    this.initialize();
    this.speed = -3;
    this.nextY = null;
    this.shouldDie = false;
}
Laser.prototype = new createjs.Sprite();
Laser.prototype.Sprite_initialize = Laser.prototype.initialize;
Laser.prototype.initialize = function () {
    // console.log("initializing" + spriteSheet);
    this.Sprite_initialize(spriteSheet, "stone_1");
    this.paused = true;
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











/*function buildWalls() {
 var wall = new createjs.Shape();
 wall.graphics.beginFill('#333');
 wall.graphics.drawRect(0, 0, WALL_THICKNESS, canvas.height);
 stage.addChild(wall);
 wall = new createjs.Shape();
 wall.graphics.beginFill('#333');
 wall.graphics.drawRect(0, 0, WALL_THICKNESS, canvas.height);
 wall.x = canvas.width - WALL_THICKNESS;
 stage.addChild(wall);
 wall = new createjs.Shape();
 wall.graphics.beginFill('#333');
 wall.graphics.drawRect(0, 0, canvas, WALL_THICKNESS);
 stage.addChild(wall);
 leftWall = WALL_THICKNESS;
 rightWall = canvas.width - WALL_THICKNESS;
 ceiling = WALL_THICKNESS;
 }
 */

/*function buildPaddle() {
 paddle = new createjs.Shape();
 paddle.width = PADDLE_WIDTH;
 paddle.height = 20;
 paddle.graphics.beginFill('#3e6dc0').drawRect(0, 0, paddle.width, paddle.height);
 paddle.nextX = 0;
 paddle.x = 20;
 paddle.y = canvas.height - paddle.height - SCORE_BOARD_HEIGHT;
 stage.addChild(paddle);
 }
 function buildPuck() {
 puck = new createjs.Shape();
 puck.graphics.beginFill('#FFFFFF').drawRect(0, 0, 10, 10);
 puck.width = 10;
 puck.height = 10;
 puck.x = canvas.width - 100;
 puck.y = 160;
 puck.velx = PUCK_SPEED;
 puck.vely = PUCK_SPEED;
 puck.isAlive = true;
 stage.addChildAt(puck, 0);
 }
 */



/*function shiftBricksDown() {
 var i, brick;
 var shiftHeight = 80;
 var len = bricks.length;
 for (i = 0; i < len; i++) {
 brick = bricks[i];
 brick.y += shiftHeight;
 if (brick.freeLife) {
 brick.freeLife.y += shiftHeight;
 }
 }
 }*/

/*function updatePaddle() {
 var nextX = paddle.x;
 if (leftKeyDown) {
 nextX = paddle.x - PADDLE_SPEED;
 if (nextX < leftWall) {
 nextX = leftWall;
 }
 }
 else if (rightKeyDown) {
 nextX = paddle.x + PADDLE_SPEED;
 if (nextX > rightWall - paddle.width) {
 nextX = rightWall - paddle.width;
 }
 }
 paddle.nextX = nextX;
 }
 function updatePuck() {
 var nextX = puck.x + puck.velx;
 var nextY = puck.y + puck.vely;
 if (nextX < leftWall) {
 nextX = leftWall;
 puck.velx *= -1;
 }
 else if (nextX > (rightWall - puck.width)) {
 nextX = rightWall - puck.width;
 puck.velx *= -1;
 }
 if (nextY < (ceiling)) {
 nextY = ceiling;
 puck.vely *= -1;
 }
 puck.nextX = nextX;
 puck.nextY = nextY;
 }
 */

/*function checkPaddle() {
 if (puck.vely > 0 && puck.isAlive && puck.nextY > (paddle.y - paddle.height) && puck.nextX >= paddle.x && puck.nextX <= (paddle.x + paddle.width)) {
 puck.nextY = paddle.y - puck.height;
 combo = 0;
 paddleHits++;
 puck.vely *= -1;
 }
 }
 function checkBricks() {
 if (!puck.isAlive) {
 return;
 }
 var i, brick;
 for (i = 0; i < bricks.length; i++) {
 brick = bricks[i];
 if (puck.nextY >= brick.y && puck.nextY <= (brick.y + brick.height) && puck.nextX >= brick.x && puck.nextX <= (brick.x + brick.width)) {
 score += brick.points;
 combo++;
 if (brick.freeLife) {
 lives++;
 createjs.Tween.get(brick.freeLife)
 .to({alpha:0, y:brick.freeLife.y - 100}, 1000)
 .call(function () {
 stage.removeChild(this);
 });
 }
 if (combo > 4) {
 score += (combo * 10);
 var comboTxt = new createjs.Text('COMBO X' + (combo * 10), '14px Times', '#FF0000');
 comboTxt.x = brick.x;
 comboTxt.y = brick.y;
 comboTxt.regX = brick.width / 2;
 comboTxt.regY = brick.height / 2;
 comboTxt.alpha = 0;
 stage.addChild(comboTxt);
 createjs.Tween.get(comboTxt)
 .wait(200)
 .to({alpha:1, scaleX:2, scaleY:2, y:comboTxt.y - 60}, 1000)
 .call(function () {
 stage.removeChild(this);
 });
 }
 stage.removeChild(brick);
 brick = null;
 bricks.splice(i, 1);
 puck.vely *= -1;
 break;
 }
 }
 }
 */


/*function removeBricks() {
 var i, brick;
 for (i = 0; i < bricks.length; i++) {
 brick = bricks[i];
 if (brick.freeLife) {
 stage.removeChild(brick.freeLife);
 }
 stage.removeChild(brick);
 }
 bricks = [];
 }*/

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