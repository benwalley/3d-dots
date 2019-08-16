var canvas = document.getElementById('main-dots');
var ctx = canvas.getContext('2d');
var drawing = true;
var circles = [];
var data = {
    boundingWidth: 1000,
    boundingHeight: 1000,
    boundingDepth: 500,
    maxR: 3,
    minR: .5,
    numberCircles: 200,
    ballColor: "#ffffff",
    lineColor: "#ffffff",
    backgroundColor: "#000000",
    maxLineLength: 250,
    lineStartThin: 100,
    minLineLength: 0,
    maxLineWidth: .5,
    speedX: 1,
    speedY: 1,
    speedZ: 1,
    redMin: 0,
    redMax: 255,
    greenMin: 0,
    greenMax: 255,
    blueMin: 0,
    blueMax: 255,
    rColorChangeRate: 2,
    gColorChangeRate: 2,
    bColorChangeRate: 2

};

// data object options:
// x, y, r, color,
function drawCircle(circleData) {
    ctx.beginPath();
    ctx.arc(circleData.x, circleData.y, circleData.r, 0, Math.PI * 2, true); // Outer circle
    ctx.fillStyle = circleData.color;
    ctx.fill();
}

function createRandomColor() {
    var rValue = Math.floor(Math.random() * (data.redMax - data.redMin));
    var gValue = Math.floor(Math.random() * (data.greenMax - data.greenMin));
    var bValue = Math.floor(Math.random() * (data.blueMax - data.blueMin));
    var rHex =rValue.toString(16);
    if(rHex.length == 1) {rHex = "0" + rHex};
    var gHex =gValue.toString(16);
    if(gHex.length == 1) {gHex = "0" + gHex};
    var bHex =bValue.toString(16);
    if(bHex.length == 1) {bHex = "0" + bHex};

    var fullHex = "#" + rHex + gHex + bHex;

    return fullHex
}

// data object options:
// x, y, z, r, color, dx, dy, dz
function fillData() {
    for(var i = 0; i < data.numberCircles; i++) {
        var x = Math.random() * data.boundingWidth;
        var y = Math.random() * data.boundingHeight;
        var z = Math.random() * data.boundingDepth;
        var r = data.maxR;
        var color = createRandomColor();
        var rColorChangeVal = (Math.random() * (2 * data.rColorChangeRate)) - data.rColorChangeRate;
        var gColorChangeVal = (Math.random() * (2 * data.gColorChangeRate)) - data.gColorChangeRate;
        var bColorChangeVal = (Math.random() * (2 * data.bColorChangeRate)) - data.bColorChangeRate;
        var dx = (Math.random() * data.speedX) - (data.speedX/2);
        var dy = (Math.random() * data.speedY) - (data.speedY/2);
        var dz = (Math.random() * data.speedZ) - (data.speedZ/2);

        circles.push({x, y, z, r, color, rColorChangeVal, gColorChangeVal, bColorChangeVal, dx, dy, dz});
    }
}

function drawCircles() {
    for (var i = 0; i < circles.length; i++) {
        drawCircle(circles[i]);
    }
}

function drawLines() {
    for (var i = 0; i < circles.length; i++) {
        for (var j = 0; j < circles.length; j++) {
            var distX = Math.abs(circles[i].x - circles[j].x);
            var distY = Math.abs(circles[i].y - circles[j].y);
            var distZ = Math.abs(circles[i].z - circles[j].z);

            var dist = Math.sqrt((distZ * distZ) + (distX * distX) + (distY * distY))

            if(dist < data.lineStartThin) {
                var currentLineWidth = data.maxLineWidth;
            } else {
                var thinRange = data.maxLineLength - data.lineStartThin;
                var dividedWidth = data.maxLineWidth / thinRange;
                var amountOverThin = dist - data.lineStartThin;
                var currentLineWidth = data.maxLineWidth - (dividedWidth * amountOverThin);
            }
            

            if(dist < data.maxLineLength) {
                var gradient =ctx.createLinearGradient(circles[i].x, circles[i].y, circles[j].x, circles[j].y);
                gradient.addColorStop("0", circles[i].color);
                gradient.addColorStop("1.0", circles[j].color);

                ctx.beginPath();
                ctx.moveTo(circles[i].x, circles[i].y);
                ctx.lineTo(circles[j].x, circles[j].y);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = currentLineWidth;
                ctx.stroke()
            }
        }
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    data.boundingWidth =  window.innerWidth;
    data.boundingHeight = window.innerHeight;
}

function calculatePosChange() {
    for (var i = 0; i < circles.length; i++) {
        circles[i].x += circles[i].dx;
        if((circles[i].x <= 0 && circles[i].dx < 0) || (circles[i].x >= data.boundingWidth && circles[i].dx > 0)) {
            circles[i].dx = circles[i].dx * -1;
        }

        circles[i].y += circles[i].dy;
        if((circles[i].y <= 0 && circles[i].dy < 0) || (circles[i].y >= data.boundingHeight && circles[i].dy > 0)) {
            circles[i].dy = circles[i].dy * -1;
        }

        circles[i].z += circles[i].dz;
        if((circles[i].z <= 0 && circles[i].dz < 0) || (circles[i].z >= data.boundingDepth && circles[i].dz > 0)) {
            circles[i].dz = circles[i].dz * -1;
        }

        // calculate radius
        var diff = data.maxR - data.minR;
        var step = diff/data.boundingDepth;
        var final = circles[i].z * step;
        final = final + data.minR;

        circles[i].r = final;

        // calculateColorChange
        var r = circles[i].color.slice(1, 3);
        var g = circles[i].color.slice(3, 5);
        var b = circles[i].color.slice(5, 7);
        r = parseInt(r, 16);
        g = parseInt(g, 16);
        b = parseInt(b, 16);
        // if red is inside constraint
        if(r + circles[i].rColorChangeVal > data.redMax || r + circles[i].rColorChangeVal < data.redMin) {
            circles[i].rColorChangeVal = circles[i].rColorChangeVal * -1;
        } 
        r = Math.floor(r + circles[i].rColorChangeVal);

        if(g + circles[i].gColorChangeVal > data.greenMax || g + circles[i].gColorChangeVal < data.greenMin) {
            circles[i].gColorChangeVal = circles[i].gColorChangeVal * -1;
        } 
        g = Math.floor(g + circles[i].gColorChangeVal);

        if(b + circles[i].bColorChangeVal > data.blueMax || b + circles[i].bColorChangeVal < data.blueMin) {
            circles[i].bColorChangeVal = circles[i].bColorChangeVal * -1;
        } 
        b = Math.floor(b + circles[i].bColorChangeVal);

        r = r.toString(16);
        g = g.toString(16);
        b = b.toString(16);

        if(r.length == 1) {r = "0" + r};
        if(g.length == 1) {g = "0" + g};
        if(b.length == 1) {b = "0" + b};

        circles[i].color = "#" + r + g + b;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    calculatePosChange();
    drawLines();
    drawCircles();
    if(drawing) {
         window.requestAnimationFrame(draw)
    }
}

function init() {
    resizeCanvas();
    fillData();
    draw();
}

init();