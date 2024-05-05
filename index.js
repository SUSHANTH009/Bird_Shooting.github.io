const canvas = document.getElementById('BirdCanvas');
const ctx = canvas.getContext('2d');

const manPosition = { x: 130, y: 500 };

let score = 0;
let isShooting = false;
let downedBirdsList = [];

const skyWidth = canvas.width;
const skyHeight = 500;

let bullets = [];
const bulletSpeed = 80; 
const bulletRadius = 5; 

let birds = [
  { x: 300, y: 350, size: 30, isDowned: false, velocityX: 3.5 },
  { x: 500, y: 400, size: 30, isDowned: false, velocityX: 4 },
  { x: 700, y: 300, size: 30, isDowned: false, velocityX: 3 },
  { x: 900, y: 150, size: 30, isDowned: false, velocityX: 4.5 },
  { x: 1100, y: 200, size: 30, isDowned: false, velocityX: 3.5 },
  { x: 1300, y: 250, size: 15, isDowned: false, velocityX: 4 },
];

function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); 
    gradient.addColorStop(1, '#4682B4'); 
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, skyWidth, skyHeight);
}

function drawCloud(x, y) 
{
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - 40, y + 20, x - 40, y + 70, x + 60, y + 70);
  ctx.bezierCurveTo(x + 80, y + 100, x + 150, y + 100, x + 170, y + 70);
  ctx.bezierCurveTo(x + 250, y + 70, x + 250, y + 40, x + 220, y + 20);
  ctx.bezierCurveTo(x + 260, y - 40, x + 200, y - 50, x + 170, y - 30);
  ctx.bezierCurveTo(x + 150, y - 75, x + 80, y - 60, x + 80, y - 30);
  ctx.bezierCurveTo(x + 30, y - 75, x - 20, y - 60, x, y);
  ctx.closePath();
  ctx.fill();
}

let clouds = [
  { x: 150, y: 100, opacity: 1.0 },
  { x: 600, y: 150, opacity: 0.8 },
  { x: 1100, y: 120, opacity: 0.9 }
];

function updateClouds() {
  clouds.forEach(cloud => {
      cloud.x += 0.5;
      if (cloud.x > canvas.width + 300) {
          cloud.x = -300; 
      }
  });
}

function drawManWithGun(x, y, angle) {

  ctx.fillStyle = '#292424';
  ctx.fillRect(x - 20, y, 40, 50);


  ctx.fillStyle = '#dbbba4';
  ctx.beginPath();
  ctx.arc(x, y - 20, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y + 10);
  ctx.rotate(angle);

  ctx.fillStyle = 'darkslategray';
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(45, -5);
  ctx.lineTo(45, 5);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();


  ctx.fillStyle = 'silver';
  ctx.fillRect(30, -8, 8, 3);


  ctx.fillStyle = 'saddlebrown';
  ctx.fillRect(-5, -7, 5, 14);

  ctx.restore();

  ctx.fillStyle = '#404040';
  ctx.fillRect(x - 12, y + 50, 10, 20);
  ctx.fillRect(x + 2, y + 50, 10, 20);
}


let wingAngle = 0;
let wingDirection = 1;
const wingAmplitude = Math.PI / 8; 

function drawBird(x, y, size) {
  wingAngle += 0.05 * wingDirection;
  if (wingAngle > wingAmplitude || wingAngle < -wingAmplitude) {
      wingDirection *= -1;
  }

  ctx.fillStyle = 'darkgray'; 
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'gray';
  ctx.beginPath();
  ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.3, 0, Math.PI * 2);
  ctx.fill();


  ctx.fillStyle = 'black';
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(wingAngle) * wingAmplitude);


  ctx.beginPath();
  ctx.moveTo(-size * 0.6, 0);
  ctx.quadraticCurveTo(-size * 1.2, -size * 0.3, -size * 1.2, size * 0.3);
  ctx.quadraticCurveTo(-size * 1.2, size * 0.6, -size * 0.6, 0);
  ctx.fill();


  ctx.beginPath();
  ctx.moveTo(size * 0.6, 0);
  ctx.quadraticCurveTo(size * 1.2, -size * 0.3, size * 1.2, size * 0.3);
  ctx.quadraticCurveTo(size * 1.2, size * 0.6, size * 0.6, 0);
  ctx.fill();
  ctx.restore();


  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.6, y);
  ctx.lineTo(x - size * 1.2, y - size * 0.3);
  ctx.lineTo(x - size * 1.2, y + size * 0.3);
  ctx.closePath();
  ctx.fill();


  ctx.fillStyle = 'orange';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.7, y - size * 0.2);
  ctx.lineTo(x + size * 1.0, y - size * 0.1);
  ctx.lineTo(x + size * 0.7, y);
  ctx.closePath();
  ctx.fill();


  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(x + size * 0.5, y - size * 0.25, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(x + size * 0.5, y - size * 0.25, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
}


function calculateAngle(x, y, targetX, targetY) {
  return Math.atan2(targetY - y, targetX - x);
}

function shootBird() {
  birds.forEach(bird => {
      if (!bird.isDowned && Math.sqrt((clickX - bird.x) ** 2 + (clickY - bird.y) ** 2) < bird.size) {
          bird.isDowned = true;
          score++;
          bullets.push({
              x: manPosition.x,
              y: manPosition.y - 30,
              toX: bird.x,
              toY: bird.y,
              reached: false
          });
          playSound();
      }
  });
}

function updateBullets() {
  bullets = bullets.filter(bullet => !bullet.reached);
  bullets.forEach(bullet => {
      const dx = bullet.toX - bullet.x;
      const dy = bullet.toY - bullet.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < bulletSpeed) {
          bullet.x = bullet.toX;
          bullet.y = bullet.toY;
          bullet.reached = true;
      } else {
          const ratio = bulletSpeed / distance;
          bullet.x += dx * ratio;
          bullet.y += dy * ratio;
      }
  });
}

function drawBullets() {
  ctx.fillStyle = 'black';
  bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI * 2);
      ctx.fill();
  });
}

function shootBird() {
  let hit = false; 

  birds.forEach(bird => {
      if (!bird.isDowned && Math.sqrt((clickX - bird.x) ** 2 + (clickY - bird.y) ** 2) < bird.size) {
          bird.isDowned = true;
          score++;
          hit = true;
      }
  });

  bullets.push({
      x: manPosition.x,
      y: manPosition.y - 30,
      toX: clickX,
      toY: clickY,
      reached: false
  });
}

function drawRoad() {
  const roadY = skyHeight; 
  const roadHeight = canvas.height - skyHeight;

  ctx.fillStyle = '#666'; 
  ctx.fillRect(0, roadY, canvas.width, roadHeight);

  ctx.fillStyle = '#EEE';  
  const markingWidth = 20;
  const markingHeight = 10;
  const markingSpacing = 40;

  for (let x = 0; x < canvas.width; x += markingSpacing + markingWidth) {
      ctx.fillRect(x, roadY + roadHeight / 2 - markingHeight / 2, markingWidth, markingHeight);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSky();
  drawRoad();
  updateClouds();
  clouds.forEach(cloud => drawCloud(cloud.x, cloud.y, cloud.opacity));

  updateBullets();
  drawBullets();

  birds = birds.filter(b => !b.isDowned);
  birds.forEach(b => {
      if (!b.isDowned) {
          drawBird(b.x, b.y, b.size);
      }
      b.x += b.velocityX;
      if (b.x > skyWidth) {
          b.x = 0;
      }
  });

  let angle = calculateAngle(manPosition.x, manPosition.y, mouseX, mouseY);
  drawManWithGun(manPosition.x, manPosition.y - 50, angle);

  requestAnimationFrame(draw);
}

let mouseX, mouseY, clickX, clickY;
canvas.addEventListener('mousemove', function(event) {
  mouseX = event.clientX - canvas.getBoundingClientRect().left;
  mouseY = event.clientY - canvas.getBoundingClientRect().top;
});

canvas.addEventListener('click', function(event) {
  if (!isShooting) {
      clickX = event.clientX - canvas.getBoundingClientRect().left;
      clickY = event.clientY - canvas.getBoundingClientRect().top;
      shootBird();
      isShooting = true;
      setTimeout(function() {
          isShooting = false;
      }, 300);
  }
});

function downloadCanvas() {
  window.requestAnimationFrame(function() {
      var dataURL = canvas.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = dataURL;
      a.download = 'canvas-screenshot.png';
      a.click();
  });
}

function addDownloadButton() 
{

  const button = document.createElement('button');
  const buttonImage = document.createElement('img');
  buttonImage.src = 'download.png'; 
  buttonImage.style.width = '120px'; 
  buttonImage.style.height = '100px'; 
  button.appendChild(buttonImage);

  button.style.position = 'absolute';
  button.style.top = '85px'; 
  button.style.right = '30px';
  button.style.padding = '10px';
  button.style.background = 'transparent';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';

  button.addEventListener('click', downloadCanvas);
  document.body.appendChild(button);
}

draw();
addDownloadButton();
