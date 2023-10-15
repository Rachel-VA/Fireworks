// Canvas setup
var r = document.getElementById("Canvas1");
var ctx = r.getContext("2d");

// Canvas dimensions
var rwidth, rheight;

// Lists to manage shells and particles
var shells = [];
var pass = [];

// List of colors in HEX format
var colors = ['#ff5252', '#ff4081', '#e040fb', '#7c4dff', '#ffffff', '#53dfff', '#18ffff', '#64ffda', '#69f0ae', '#b2fff9', '#ffffff', '#ffe6e6', '#ff1a1a', '#00ff80', '#ff00ff', '#ffffff', '#0040ff', '#ff0080'];

// Pre-parse the colors into RGB format for potential manipulations
var parsedColors = colors.map(color => ({
    r: parseInt(color.slice(1, 3), 16),
    g: parseInt(color.slice(3, 5), 16),
    b: parseInt(color.slice(5, 7), 16)
}));

// Event to reset canvas dimensions when the window is resized
window.onresize = function() { reset(); }
reset();

// Adjust canvas dimensions to fit the window size
function reset() {
    rwidth = window.innerWidth;
    rheight = window.innerHeight;
    r.width = rwidth;
    r.height = rheight;
}

// Returns a random type of firework
function randomFireworkType() {
    var types = ['default', 'chrysanthemum', 'peony'];
    return types[Math.floor(Math.random() * types.length)];
}

// Creates a new shell (firework before it bursts)
function newShell() {
    var shell = {};
    shell.x = 0.5 + Math.random() * 0.2;
    shell.y = 1;
    shell.xoff = (Math.random() - 0.5) * 0.009;
    shell.yoff = -(0.005 + Math.random() * 0.015);
    shell.size = Math.random() * 6 + 3;

    var startIdx = Math.floor(Math.random() * colors.length);
    var endIdx = Math.floor(Math.random() * colors.length);
    shell.colorStart = colors[startIdx];
    shell.colorEnd = colors[endIdx];
    shell.startColorIndex = startIdx;
    shell.endColorIndex = endIdx;

    shell.alpha = 1.5;
    shell.type = randomFireworkType();

    shells.push(shell);
}

// List to manage particles trails
var trails = [];

// Creates new particles (burst of the firework)
function newPass(shell) {
    var pasCount = Math.ceil(Math.pow(shell.size, 2) * Math.PI * 0.6);
    for (let i = 0; i < pasCount; i++) {
        var pas = {};
        pas.x = shell.x * rwidth;
        pas.y = shell.y * rheight;
        var angle = 2 * Math.PI * Math.random();
        var speed = Math.sqrt(shell.size) * 0.8;

        pas.xoff = speed * Math.cos(angle);
        pas.yoff = speed * Math.sin(angle);
        pas.size = Math.sqrt(shell.size) * 1;
        pas.size = Math.random() * 6 + 3;
        
        pas.alpha = 1.5;
        pas.colorStart = shell.colorStart;
        pas.colorEnd = shell.colorEnd;
        pas.startColorIndex = shell.startColorIndex;
        pas.endColorIndex = shell.endColorIndex;

        switch (shell.type) {
            case 'chrysanthemum':
                pas.xoff *= (Math.random() * 0.7 + 1.5);
                pas.yoff *= (Math.random() * 0.7 + 1.5);
                break;
            case 'peony':
                pas.size *= 1.25;
                pas.yoff += 0.005;
                break;
            default:
                break;
        }

        pas.lifespan = Math.random() * 30 + 20;
        var speedFactor = Math.random() * 0.5 + 0.75;
        pas.xoff *= speedFactor;
        pas.yoff *= speedFactor;

        if (pass.length < 1000) { pass.push(pas); }

        // Create a trail particle
        var trail = { x: pas.x, y: pas.y, size: pas.size, alpha: 0.5, colorStart: pas.colorStart, colorEnd: pas.colorEnd };
        trails.push(trail);
    }
}

// Variable to keep track of the animation frame
let animationFrame;

// Function to start the fireworks animation
function startFireworks() {
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.fillRect(0, 0, rwidth, rheight);

    if (shells.length < 20 && Math.random() > 0.96) { newShell(); }

    let shellsToRemove = [];

    for (let shell of shells) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = shell.colorStart;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        var gradient = ctx.createRadialGradient(shell.x * rwidth, shell.y * rheight, 0, shell.x * rwidth, shell.y * rheight, shell.size);
        gradient.addColorStop(0, shell.colorStart);
        gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

        ctx.beginPath();
        ctx.arc(shell.x * rwidth, shell.y * rheight, shell.size, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        shell.x += shell.xoff;
        shell.y += shell.yoff;
        shell.xoff *= 0.99;
        shell.yoff *= 0.992;

        if (shell.y < 0.4 || shell.yoff > -0.001) {
            newPass(shell);
            shellsToRemove.push(shell);
        }
    }
    shells = shells.filter(shell => !shellsToRemove.includes(shell));

    let passToRemove = [];
    for (let pas of pass) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = pas.colorStart;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        if (!pas.lifespan) {
            pas.lifespan = 100 + Math.random() * 150;
        }

        let factor = 1 - pas.lifespan / (100 + 150);

        let startColor = parsedColors[pas.startColorIndex];
        let endColor = parsedColors[pas.endColorIndex];

        let r = startColor.r + factor * (endColor.r - startColor.r);
        let g = startColor.g + factor * (endColor.g - startColor.g);
        let b = startColor.b + factor * (endColor.b - startColor.b);

        var gradient = ctx.createRadialGradient(pas.x, pas.y, 0, pas.x, pas.y, pas.size);

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${pas.alpha})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

        ctx.beginPath();
        ctx.arc(pas.x, pas.y, pas.size, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        pas.x += pas.xoff;
        pas.y += pas.yoff;

        pas.yoff += (0.0008 + Math.random() * 0.0004);
        pas.xoff *= 0.98;

        pas.alpha -= 1 / pas.lifespan;
        pas.size *= 0.995;

        pas.lifespan--;

        if (pas.y > rheight + 10 || pas.alpha <= 0 || pas.lifespan <= 0) {
            passToRemove.push(pas);
        }

        pas.yoff += 0.008;
        pas.size *= (Math.random() * 0.3 + 0.8);

        if (pas.lifespan === 100) {
            for (let i = 0; i < 20; i++) {
                let burstPas = { ...pas };
                burstPas.size *= 1.5;
                burstPas.lifespan = 40 + Math.random() * 70;
                burstPas.xoff = (Math.random() - 0.5) * 0.9;
                burstPas.yoff = (Math.random() - 0.5) * 0.08;
                pass.push(burstPas);
            }
        }

        if (pas.lifespan > 80) {
            for (let i = 0; i < 5; i++) {
                let trailPas = { ...pas };
                trailPas.size *= 0.7;
                trailPas.lifespan = 10 + Math.random() * 12;
                trailPas.alpha *= 0.4;
                trailPas.x += (Math.random() - 0.5) * 2;
                trailPas.y += (Math.random() - 0.5) * 2;
                pass.push(trailPas);
            }
        }
    }
    pass = pass.filter(pas => !passToRemove.includes(pas));

    // Request the next animation frame
    animationFrame = requestAnimationFrame(startFireworks);
}

// Get references to the button and audio elements
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const fireworksAudio = document.getElementById("fireworksAudio");

// Add a click event listener to the start button
startButton.addEventListener("click", function () {
    fireworksAudio.currentTime = 0; // Reset audio to the beginning
    fireworksAudio.play(); // Play the audio
    startFireworks(); // Start the fireworks animation
});

// Add a click event listener to the stop button
stopButton.addEventListener("click", function () {
    fireworksAudio.pause(); // Pause the audio
    cancelAnimationFrame(animationFrame); // Stop the animation frame
});

// Initial setup when the page loads
fireworksAudio.loop = true; // Loop the audio
