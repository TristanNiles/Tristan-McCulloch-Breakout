let canvas;
var context;
let wallLeftPos; //absolute position of left wall of canvas, not relative to canvas
let wallRightPos; //absolute position of right wall of canvas, not relative to canvas
let wallTopPos;
let mousePos;
let row = 3;
let col = 7;
let width = 200;
let height = 50;
let bricks = [];
let spaceX = 5;
let spaceY = 5;
let score = 0;
let level = 1;
let startGame = false;
let startLevel = false;
let gameOver = false;
let lives = 3;
let healthTotal = 0; //the health of all the bricks for the level
let test = 0;
let initialBall = false;
let brickLightest = '#fdfa66';
let brickLight = '#facd60';
let brickDark = '#fb7756';
let brickDarkest = '#e74645';
let paddleColor = '#1ac0c6';
let ballColor = '#1ac0c6';
let ball;
let paddle;
let anim;

class Ball {
    constructor(x, y, dx, dy, r) {
        this._dx = dx;
        this._dy = dy;
        this._r = r;
        this._x = x
        this._y = y;
        this._speed = Math.sqrt(this._dx * this._dx + this._dy * this._dy);
        this._color = ballColor;
    }

    draw() {
        context.beginPath();
        context.arc(this._x,this._y,this._r,0, Math.PI*2, false);
        context.closePath();
        context.fillStyle = this._color;
        context.fill();
    }

    move() {
        if (this._x <= this._r || this._x >= (wallRightPos-wallLeftPos) - this._r){ //checks if edge of ball is within canvas width
            this._dx = -1*this._dx;
        }
        else if (this._y <= this._r) { //checks if edge of ball is below top of canvas
            this._dy = Math.abs(this._dy);
        }
        else if (this._y > 600){//check for ball below paddle
            this._dx = Math.abs(this._dx);
            this._dy = Math.abs(this._dy);
            lives--;
            heartDisplay();
            softReset();
        }

        this._x += this._dx;
        this._y += this._dy;
        hitPaddle();
        this.draw();
    }

    normalize(x, y) {
        this._dx = (x/Math.sqrt(x*x+y*y)) * this._speed;
        this._dy = (y/Math.sqrt(x*x+y*y)) * this._speed;
    }

    set x(value) {
        this._x = value;
    }
    set y(value) {
        this._y = value;
    }
    set dx(value) {
        this._dx = value;
        this._speed = Math.sqrt(this._dx * this._dx + this._dy * this._dy);
    }
    set dy(value) {
        this._dy = value;
        this._speed = Math.sqrt(this._dx * this._dx + this._dy * this._dy);
    }

    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get dx() {
        return this._dx;
    }
    get dy() {
        return this._dy;
    }
    get r() {
        return this._r;
    }
}

class Paddle {
    constructor(width, height, x, y) {
        this._width = width;
        this._height = height;
        this._x = x;
        this._y = y;
        this._color = paddleColor;
    } 

    draw() {
        this._x = mousePos;
        if (this._x >= (this._width/2) && this._x <= wallRightPos-wallLeftPos-(this._width/2)) { //Paddle movements within the game border 
            context.beginPath();
            context.fillStyle = this._color;
            context.fillRect(this._x - (this._width/2), this._y, this._width, this._height);
            context.closePath();
        }
        if(this._x < (this._width/2)) { //For left side border case
            this._x=this._width/2;
            context.beginPath();
            context.fillStyle = this._color;
            context.fillRect(0, this._y, this._width, this._height);
            context.closePath();
        }
        if(this._x > (wallRightPos-wallLeftPos) - (this._width/2)) { //For right side border case
            this._x=(wallRightPos-wallLeftPos) - (this._width/2);
            context.beginPath();
            context.fillStyle = this._color;
            context.fillRect(wallRightPos-wallLeftPos - this._width, this._y, this._width, this._height);
            context.closePath();
        }
    }

    set x(value) {
        this._x = value;
    }
    set y(value) {
        this._y = value;
    }
    set width(value) {
        this._width = value;
    }
    set height(value) {
        this._height = value;
    }

    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
}

document.addEventListener('click', r => {console.log(r.clientX);});
document.getElementById("canvasContainer").addEventListener("click", start);
document.addEventListener('mousemove', e => { 
    mousePos = e.clientX -wallLeftPos;
});

function renderAnimation () {
    context.clearRect(0, 0, 1400, 600);
    drawBricks();
    hitDetect();
    paddle.draw();
    if (startGame == true) { 
        ball.move();
    } else {
        if (level == 2 && startLevel == false) {
            level2Msg();
        }
        ball.x = paddle.x;
        ball.draw()
    }
    anim = requestAnimationFrame(renderAnimation);
    if (gameOver == true) {
        gameOverMsg();
    }
}

/*
* @pre canvas is clicked on
* @post calls moveball on loop
* @param none
* @return none
*/
function start(){
    if (startLevel == false) {
        startLevel = true;
    }
    if (startGame == false) {
      startGame = true;
    }
}


/*
* @pre lost a life
* @post sets ball and paddle back to original position, stops the ball moving until a click activates start()
* @param none
* @return none
*/
function softReset() {
    startGame = false;
    ball.y = 530;
}


/*
* @pre none
* @post if ball hits paddle dy is changed so that ball bounces off paddle
* @param none
* @return none
*/
function hitPaddle() {
  //hits top of paddle
  if( (ball.y + ball.r >= paddle.y && ball.y + ball.r <= paddle.y + ball.dy) && (ball.x + ball.r >= paddle.x - paddle.width/2) && (ball.x - ball.r < paddle.x + paddle.width/2) ) { // (ball below top of paddle with margin of error = speed) && (ball to the right of left side of paddle) &&  (ball to the left of right side of paddle)
    let y = -1 * (paddle.width/2)/(Math.tan( (1/3)*Math.PI ) );
    let x = ball.x - paddle.x;
    ball.normalize(x, y);

  }
  //hits left side of paddle
  else if ( (ball.y + ball.r > paddle.y) && (ball.y - ball.r < paddle.y + paddle.height) && ( ball.x + ball.r >= paddle.x - paddle.width/2 && ball.x + ball.r <= paddle.x - paddle.width/2 + Math.abs(ball.dx)) ) { //(ball below top of paddle) && (ball above bottom of paddle) && (ball to right of left side of paddle with margin of error = speed)
    ball.dx = Math.abs(ball.dx) * -1;
  }
  //hits right side of paddle
  else if ( (ball.y + ball.r > paddle.y) && (ball.y - ball.r < paddle.y + paddle.height) && ( ball.x - ball.r <= paddle.x + paddle.width/2 && ball.x - ball.r >= paddle.x + paddle.width/2 - Math.abs(ball.dx)) ) { //(ball below top of paddle) && (ball above bottom of paddle) && (ball to left of right side of paddle with margin of error = speed)
    ball.dx = Math.abs(ball.dx) * 1;
  }

}

/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------BRICK---------------------------------------------------------------------------------------*/
/*-------------------------------------------------------------------------------------FUNCTIONS-------------------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

/*
* @pre none
* @post bricks array is made and bricks are given a position, health, and on status
* @param none
* @return none
*/
function makeBricks(){
    if(test == 1) {
      row =1;
      col = 3;
    }
    if(level == 1){
        for(let i = 0; i < col; i++){
            bricks[i] = [];
            for(let j = 0; j < row; j++){
                bricks[i][j] = { x: 0, y: 0, on: 'yes', health: 0}
                bricks[i][j].x = i * (width + spaceX);
                bricks[i][j].y = j * (height + spaceY);
		if ((j == 0) && (test != 1)) { bricks[i][j].health = 3;}
		else if ((j == 1) && (test != 1)) { bricks[i][j].health = 2;}
		else if ((j == 2) && (test != 1)) { bricks[i][j].health = 1;}
		else if (test == 1) { 
            bricks[i][j].health = 1;
        }
	        healthTotal = healthTotal + bricks[i][j].health;
            }
        }
    }
    else if(level == 2){
	   //healthTotal = 0;//reset health total
        for(let i = 0; i < col + 1; i++){
            bricks[i] = [];
            for(let j = 0; j < row + 1; j++){
                bricks[i][j] = { x: 0, y: 0, on: 'yes'}
                bricks[i][j].x = i * (width + spaceX);
                bricks[i][j].y = j * (height + spaceY);
		      if (j == 0) { bricks[i][j].health = 4;}
		      if (j == 1) { bricks[i][j].health = 3;}
		      if (j == 2) { bricks[i][j].health = 2;}
		      if (j == 3) { bricks[i][j].health = 1;}
	           healthTotal = healthTotal + bricks[i][j].health;
            }
        }
    }
}
/*
* @pre bricks array must be created
* @post bricks are drawn to the screen
* @param none
* @return none
*/
function drawBricks(){
    if(level == 1){
        for(let i = 0; i < col; i++){
            for(let j = 0; j < row; j++){
                if(bricks[i][j].on == 'yes'){
                    context.beginPath();
                    if(bricks[i][j].health == 1){
                        context.fillStyle = brickDark;
                    }
                    else if (bricks[i][j].health == 2){
                        context.fillStyle = brickLight;
                    }
                    else{
                        context.fillStyle = brickLightest;
                    }
                    context.rect(bricks[i][j].x, bricks[i][j].y, width, height);
                    context.closePath(); 
                    context.fill(); 
                }          
            }
        }
    }
    else if (level == 2){
        for(let i = 0; i < col + 1; i++){
            for(let j = 0; j < row + 1; j++){
                if(bricks[i][j].on == 'yes'){
                    context.beginPath();
                    if(bricks[i][j].health == 1){
                        context.fillStyle = brickDarkest;
                    }
                    else if (bricks[i][j].health == 2){

                        context.fillStyle = brickDark;
                    }
                    else if (bricks[i][j].health == 3){
                        context.fillStyle = brickLight;
                    }
                    else if (bricks[i][j].health == 4){
                        context.fillStyle = brickLightest;
                    }
                    else {
		                  context.fillStyle = "green";
		            }
                    context.rect(bricks[i][j].x, bricks[i][j].y, width - 20, height - 20);
                    context.closePath(); 
                    context.fill(); 
                }          
            }
        }
    }
}

/*
* @pre none
* @post reduces brick health, updates score board, alerts user of loss or level pass
* @param none
* @return none
*/
function hitDetect(){

    let hit = 0;
    if(level == 1){
        for(let i = 0; i < col; i++){
            for(let j = 0; j < row; j++){

                if( (ball.y + ball.r >= bricks[i][j].y && ball.y + ball.r <= bricks[i][j].y + ball.dy) && (ball.x + ball.r >= bricks[i][j].x) && (ball.x - ball.r < bricks[i][j].x + width) && bricks[i][j].on == 'yes') { 
                    ball.dy = Math.abs(ball.dy) * -1;
                    hit = 1;
                }
                else if ( (ball.y + ball.r > bricks[i][j].y) && (ball.y - ball.r < bricks[i][j].y + height) && ( ball.x + ball.r >= bricks[i][j].x && ball.x + ball.r <= bricks[i][j].x + Math.abs(ball.dx)) && bricks[i][j].on == 'yes') {
                    ball.dx = Math.abs(ball.dx) * -1;
                    hit = 1;

                }
                else if ( (ball.y + ball.r > bricks[i][j].y) && (ball.y - ball.r < bricks[i][j].y + height) && ( ball.x - ball.r <= bricks[i][j].x + width && ball.x - ball.r >= bricks[i][j].x + width - Math.abs(ball.dx)) && bricks[i][j].on == 'yes') {
                    ball.dx = Math.abs(ball.dx) * 1;
                    hit = 1;
                }
                else if ((ball.y - ball.r <= bricks[i][j].y + height  && ball.y - ball.r >= bricks[i][j].y + height + ball.dy) && (ball.x + ball.r >= bricks[i][j].x) && (ball.x - ball.r < bricks[i][j].x + width) && bricks[i][j].on == 'yes') {
                    ball.dy = Math.abs(ball.dy) * 1;
                    hit = 1;
                }


                if (hit == 1) {
                    score++;
                    updateScoreBoard(score);
                    bricks[i][j].health--;
                    if(bricks[i][j].health < 1) {
                        bricks[i][j].on = 'no';
                    }
                    hit = 0;

                }

                if(score == healthTotal && level == 1){
                    score+=10;
                    level = 2;
                    startLevel = false;                    
                    updateScoreBoard(score);
                    softReset();
                    makeBricks();
                    drawBricks();
                }

                if(score == healthTotal) {
                    gameOver = true;
                }

            }
        }
    }
    else if(level == 2){
        for(let i = 0; i < col + 1; i++){
            for(let j = 0; j < row + 1; j++){
                if( (ball.y + ball.r >= bricks[i][j].y && ball.y + ball.r <= bricks[i][j].y + ball.dy) && (ball.x + ball.r >= bricks[i][j].x) && (ball.x - ball.r < bricks[i][j].x + width) && bricks[i][j].on == 'yes') { 
                    ball.dy = Math.abs(ball.dy) * -1;
                    hit = 1;
                }
                else if ( (ball.y + ball.r > bricks[i][j].y) && (ball.y - ball.r < bricks[i][j].y + height) && ( ball.x + ball.r >= bricks[i][j].x && ball.x + ball.r <= bricks[i][j].x + Math.abs(ball.dx)) && bricks[i][j].on == 'yes') {
                    ball.dx = Math.abs(ball.dx) * -1;
                    hit = 1;

                }
                else if ( (ball.y + ball.r > bricks[i][j].y) && (ball.y - ball.r < bricks[i][j].y + height) && ( ball.x - ball.r <= bricks[i][j].x + width && ball.x - ball.r >= bricks[i][j].x + width - Math.abs(ball.dx)) && bricks[i][j].on == 'yes') {
                    ball.dx = Math.abs(ball.dx) * 1;
                    hit = 1;
                }
                else if ((ball.y - ball.r <= bricks[i][j].y + height  && ball.y - ball.r >= bricks[i][j].y + height + ball.dy) && (ball.x + ball.r >= bricks[i][j].x) && (ball.x - ball.r < bricks[i][j].x + width) && bricks[i][j].on == 'yes') {
                    ball.dy = Math.abs(ball.dy) * 1;
                    hit = 1;
                }


                if (hit == 1) {
                    score++;
                    updateScoreBoard(score);
                    bricks[i][j].health--;
                    if(bricks[i][j].health < 1) {
                        bricks[i][j].on = 'no';
                    }
                    hit = 0;

                }
            	    if(score == healthTotal) {
                        gameOver = true;
                    }
                }
            }
        }
    }




/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------STYLING--------------------------------------------------------------------------------------*/
/*-------------------------------------------------------------------------------------FUNCTIONS-------------------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

/*
* @pre speed button is clicked
* @post changes ball speed based on button click
* @param none
* @return none
*/
function btnSpeed(id, id2, id3){
    let btnSelect = document.querySelectorAll("label[for='" + id + "'] h4")[0];
    btnSelect.style.top = "calc(50% + 0.3em)";

    let btnOther1 = document.querySelectorAll("label[for='" + id2 + "'] h4")[0];
    btnOther1.style.top = "50%";
    let btnOther2 = document.querySelectorAll("label[for='" + id3 + "'] h4")[0];
    btnOther2.style.top = "50%";

    if (id == 'btn1x'){
        ball.dx = 2*(ball.dx)/(Math.abs(ball.dx));
        ball.dy = 2*(ball.dy)/(Math.abs(ball.dy));
    }
    else if (id == 'btn2x'){
        ball.dx = 4*(ball.dx)/(Math.abs(ball.dx));
        ball.dy = 4*(ball.dy)/(Math.abs(ball.dy));
    }
    else if (id == 'btn3x'){
        ball.dx = 6*(ball.dx)/(Math.abs(ball.dx));
        ball.dy = 6*(ball.dy)/(Math.abs(ball.dy));
    }
}


/*
* @pre brick is hit
* @post updates scoreboard
* @param none
* @return none
*/
function updateScoreBoard(score){
    let scoreboardString = ''
    for (let i = score.toString().length; i<3; i++) {
        scoreboardString += '0'
    }
	scoreboardString += score;
    document.getElementById('score').innerHTML = scoreboardString;
}


document.addEventListener("DOMContentLoaded", () => {
    canvas = document.querySelector("#projectCanvas");
    context = canvas.getContext("2d");
    heart3 = document.getElementById('heart3');
    heart2 = document.getElementById('heart2');
    heart1 = document.getElementById('heart1');
  
    let bounds = canvas.getBoundingClientRect();
    wallLeftPos = bounds.left;
    wallRightPos = wallLeftPos + 1400;
    wallTopPos = bounds.top;


    x = Math.floor((Math.random() * 1000) + 200);//random x position between 200 and 1000
    ball = new Ball(300, 530, 2, 2, 10);
    paddle = new Paddle(100, 10, x, 550);
    makeBricks();
    drawBricks();
    renderAnimation();
    heartDisplay();
    
})

/*
* @pre all lives are lost or score = 28
* @post alerts game over for a win or score
* @param none
* @return none
*/
function gameOverMsg(){
    context.clearRect(0, 0, 1400, 600);
    let canvasContainer = document.querySelector("#canvasContainer");

    if (score == healthTotal){
        canvasContainer.style.setProperty('--outerGlow', ballColor);
        context.fillStyle = ballColor;
        context.fillRect(0, 0, 1400, 600);
        context.font = "500px 'Teko', sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = '#d2f9f9'
        context.fillText('YOU WIN!', canvas.width/2, 350);
    }
    else{
        canvasContainer.style.setProperty('--outerGlow', '#871212');
        canvasContainer.style.setProperty('--innerGlow', 'rgba(231, 70, 69, 0.7)')
        context.fillStyle = '#871212';
        context.fillRect(0, 0, 1400, 600);
        context.font = "400px 'Teko', sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = '#e74645';
        context.fillText('GAME', canvas.width/2, 200);
        context.fillText('OVER', canvas.width/2, 500);
    }
    cancelAnimationFrame(anim);
}

/*
* @pre none
* @post stops displaying 1 heart per life lost
* @param none
* @return none
*/
function heartDisplay() {
    if (lives < 3) {
        heart3.style.boxShadow = "none";
        heart3.style.background = "#5a0c0c"

    }
    if (lives < 2) {
        heart2.style.boxShadow = "none";
        heart2.style.background = "#5a0c0c"
    }
    if (lives < 1) {
        heart1.style.boxShadow = "none";
        heart1.style.background = "#5a0c0c"
        gameOver = true;
    }
    return;
}

function level2Msg() {
    context.font = "500px 'Teko', sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText('LEVEL 2', canvas.width/2, 350);

}
