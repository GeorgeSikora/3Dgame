
// CREDIT
// https://codepen.io/LeviathanProgramming/pen/bGpWmry

var ang = function(a) {
    return a * (PI / 180.0);
};

objects = [];

class Bullet {
    constructor(x, y, z, spdX, spdY, spdZ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.spdX = spdX;
        this.spdY = spdY;
        this.spdZ = spdZ;
    }
    draw() {
        push();
        ambientLight(255);
        translate(this.x, this.y, this.z);
        fill(255, 0, 0);
        box(10);
        pop();
    }
    refresh() {
        this.x += this.spdX;
        this.y += this.spdY;
        this.z += this.spdZ;
    }
}

var playerSpeed = 15;
var sensitivityX = 0.15;
var sensitivityY = 0.15;
var mx = 0, my = 0;
var keys = [];
var cam;
var yAng = 0;

var floorTexture, wallTexture, skyTexture;

document.body.addEventListener("mousemove",function(e){
    mx = e.movementX;
    my = e.movementY;
});

var D = {
    cx: 0,
    cy: 0,
    cz: 0,
    x:  0,
    y:  300, // výška kamery
    z:  200,
    r:  0,
    r2: 0,
};

function preload(){
    floorTexture = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Parquet_flooring_in_Mus%C3%A9e_des_arts_d%C3%A9coratifs_de_Strasbourg.jpg/1280px-Parquet_flooring_in_Mus%C3%A9e_des_arts_d%C3%A9coratifs_de_Strasbourg.jpg");
    wallTexture = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Stone_wall.jpg/440px-Stone_wall.jpg");   
    skyTexture = loadImage("https://upload.wikimedia.org/wikipedia/commons/a/a3/Cumulus_clouds_panorama.jpg");
}

function setup(){
    createCanvas(window.innerWidth,window.innerHeight,WEBGL);
    cam = createCamera(0, 0, (height/2.0) / tan(PI*30.0 / 180.0), 0, 0, 0, 0, 1, 0);
    document.getElementById('loadingScreen').remove();
} 

let gravity = 0;
let speedY = 0, targetSpeedY = 0;

function draw(){

    //console.log(cam.cameraMatrix.mat4[0]);

    perspective(PI / 3, width / height, 0.5, 5000);
    background(100, 190, 200);
    noStroke();

    push();
    translate(cam.eyeX, cam.eyeY, cam.eyeZ);
    rotateY(millis()/100000);
    texture(skyTexture);
    sphere(5000);
    pop();

    ambientLight(50);
    directionalLight(255, 0, 0, 0.25, 0.25, 0);
    pointLight(0, 0, 255, 100, 100, 250);

    var X = D.x;
    var Y = D.y;
    var Z = D.z;
    var centerX = D.r;
    var centerY = tan(D.r/2 * PI); // yAng
    var centerZ = yAng;
    //camera(X, Y, Z, centerX, centerY, centerZ, 0, 1, 0);
    
    D.cy = my * sensitivityY;
    D.cx = mx * sensitivityX;

    mx = 0;
    my = 0;

    if (yAng + D.cy > 75) {
        if (D.cy > 0) D.cy = 0;
    }
    if (yAng + D.cy < -75) {
        if (D.cy < 0) D.cy = 0;
    }
    
    angleMode(DEGREES);
    cam.pan(-D.cx);
    cam.tilt(D.cy);
    angleMode(RADIANS);
    //updateCamera();

    D.r += D.cx;
    yAng += D.cy;

    if (cam.eyeY > -30) {
        gravity = 0;
        cam.setPosition(cam.eyeX, -30, cam.eyeZ); // -D.y
    } else {
        cam.setPosition(cam.eyeX, cam.eyeY + (gravity += (gravity+10) * 0.01), cam.eyeZ);
    }

    speedY += (targetSpeedY - speedY) * 0.1;
    cam.move(0, speedY, 0);

    for(var i = -2.5; i < 2.5; i++){
        for(var j = -2.5; j < 2.5; j++){
        push();

        translate(i*500, 1, j*500);

        rotateY(ang(90));

        fill((i+10)*20,(j+10)*20,(i+j)*20);
        
        texture(wallTexture);
        specularMaterial(250);
        //ambientMaterial(250);
        box(100);

        pop();
        }
    }
    for(var k = -5; k < 5; k++){
        for(var l = -5; l < 5; l++){
            push();
            translate(k*500,50,l*500);
            rotateX(ang(90));
            fill(100);
            
            ambientMaterial(250);
            texture(floorTexture);
            plane(500);
            pop();
        }
    }

    for (var i = 0; i < objects.length; i++) {
        objects[i].refresh();
        objects[i].draw();
    }

    if(keys[87]){
        var cache = cam.eyeY;
        cam.move(0, 0, -playerSpeed);  
        cam.setPosition(cam.eyeX, cache, cam.eyeZ);
    }
    if(keys[83]){
        var cache = cam.eyeY;
        cam.move(0, 0, playerSpeed);
        cam.setPosition(cam.eyeX, cache, cam.eyeZ);
    }
    if(keys[65]){
        var cache = cam.eyeY;
        cam.move(-playerSpeed, 0, 0);
        cam.setPosition(cam.eyeX, cache, cam.eyeZ); 
    }
    
    if(keys[68]){
        var cache = cam.eyeY; 
        cam.move(playerSpeed, 0, 0);  
        cam.setPosition(cam.eyeX, cache, cam.eyeZ);
    }    
   if (mouseIsPressed) {
    shoot();
   }
}

function keyPressed(){
    keys[keyCode] = true;
    
    if (key == ' ') {
        gravity = 0;
        targetSpeedY = -40;
        setTimeout(() => {targetSpeedY = 0;}, 100);
    }
}

function keyReleased(){
    keys[keyCode] = false;
}

function mousePressed(){
    //got this stuff from Willard's Minecraft
    if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
    }   
}

function shoot() {
    var angleXZ = (-cam.cameraMatrix.mat4[0] * PI/2); //  - PI/2
    console.log(cam.cameraMatrix.mat4[0]);
    var angleY = 0; //radians(yAng);
    var spd = 50;

    objects.push(new Bullet(cam.eyeX, cam.eyeY, cam.eyeZ, spd * cos(angleXZ), spd * sin(angleY), spd * sin(angleXZ)));
}

function updateCamera() {
    rotationAngle = map(mouseX, 0, width, 0, TWO_PI);
    elevationAngle = map(mouseY, 0, height, 0, PI);
  
    centerX = cos(rotationAngle) * sin(elevationAngle);
    centerY = sin(rotationAngle) * sin(elevationAngle);
    centerZ = -cos(elevationAngle);
  
    camera(0, 0, 0, centerX, centerY, centerZ, 0, 0, 1);
  }