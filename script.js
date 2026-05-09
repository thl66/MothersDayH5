const experience = document.querySelector(".experience");
const envelopeButton = document.querySelector("#envelopeButton");
const flowerButton = document.querySelector("#flowerButton");
const nextButton = document.querySelector("#nextButton");
const backButton = document.querySelector("#backButton");
const resetButton = document.querySelector("#resetButton");
const subtitle = document.querySelector("#subtitle");
const blessingText = document.querySelector("#blessingText");
const canvas = document.querySelector("#petalCanvas");
const ctx = canvas.getContext("2d");

const slides = [
  {
    action: "打开信封",
    subtitle: "先轻轻打开这封信，把今天的心意送给你。",
    blessing: "谢谢你把每个平常日子，都照顾得有温度。"
  },
  {
    action: "让花发芽",
    subtitle: "花已经醒了，像很多被你照亮过的早晨。",
    blessing: "谢谢你总是先想到家里的人，也请你今天多想想自己。"
  },
  {
    action: "继续盛开",
    subtitle: "再点一下，花会替我说出更多没常说出口的话。",
    blessing: "你给过的耐心、牵挂和偏爱，我一直都记得。"
  },
  {
    action: "送出祝福",
    subtitle: "花开得更近了，像一句认真准备好的感谢。",
    blessing: "愿你每天都被温柔对待，愿开心的小事常常来找你。"
  },
  {
    action: "再看一遍",
    subtitle: "这朵花开好了，今天的爱也送到了。",
    blessing: "妈妈，母亲节快乐。糕糕和小伦把这朵花送给你，愿你往后的日子少一点操心，多一点自在；愿我们一直陪你吃饭、聊天、看花开。"
  }
];

let step = 0;
let opened = false;
let petals = [];
let lastTime = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  canvas.width = Math.floor(viewportWidth * ratio);
  canvas.height = Math.floor(viewportHeight * ratio);
  canvas.style.width = `${viewportWidth}px`;
  canvas.style.height = `${viewportHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createPetal(burst = false) {
  return {
    x: burst ? window.innerWidth / 2 + (Math.random() - 0.5) * 130 : Math.random() * window.innerWidth,
    y: burst ? window.innerHeight * 0.42 + (Math.random() - 0.5) * 60 : -30 - Math.random() * 120,
    size: 8 + Math.random() * 12,
    speed: burst ? 0.9 + Math.random() * 1.5 : 0.28 + Math.random() * 0.65,
    drift: (Math.random() - 0.5) * (burst ? 2.4 : 0.9),
    spin: (Math.random() - 0.5) * 0.08,
    angle: Math.random() * Math.PI * 2,
    alpha: burst ? 0.82 : 0.32 + Math.random() * 0.24,
    life: burst ? 130 + Math.random() * 80 : Infinity
  };
}

function seedPetals() {
  petals = Array.from({ length: 20 }, () => createPetal(false));
}

function burstPetals(count = 16) {
  for (let i = 0; i < count; i += 1) {
    petals.push(createPetal(true));
  }
}

function finaleBurst() {
  burstPetals(46);
  setTimeout(() => burstPetals(24), 260);
}

function drawPetal(petal) {
  ctx.save();
  ctx.translate(petal.x, petal.y);
  ctx.rotate(petal.angle);
  ctx.globalAlpha = Math.max(0, petal.alpha);
  const w = petal.size;
  const h = petal.size * 1.55;
  const gradient = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  gradient.addColorStop(0, "#ffd7dd");
  gradient.addColorStop(0.62, "#e9788d");
  gradient.addColorStop(1, "#bf5066");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.bezierCurveTo(w * 0.72, -h * 0.38, w * 0.58, h * 0.22, 0, h / 2);
  ctx.bezierCurveTo(-w * 0.58, h * 0.18, -w * 0.58, -h * 0.36, 0, -h / 2);
  ctx.fill();
  ctx.restore();
}

function animate(time) {
  const delta = Math.min((time - lastTime) / 16.67 || 1, 2);
  lastTime = time;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  petals = petals.filter((petal) => {
    petal.y += petal.speed * delta;
    petal.x += (Math.sin(petal.y * 0.018) * 0.35 + petal.drift) * delta;
    petal.angle += petal.spin * delta;
    if (petal.life !== Infinity) {
      petal.life -= delta;
      petal.alpha *= 0.992;
    }
    if (petal.y > window.innerHeight + 60 || petal.life <= 0) {
      return false;
    }
    drawPetal(petal);
    return true;
  });

  while (petals.length < 20) {
    petals.push(createPetal(false));
  }

  requestAnimationFrame(animate);
}

function render() {
  const current = slides[step];
  experience.dataset.opened = String(opened);
  experience.dataset.step = String(step);
  subtitle.textContent = current.subtitle;
  blessingText.textContent = current.blessing;
  nextButton.textContent = opened && step === slides.length - 1 ? slides[4].action : current.action;
  backButton.disabled = !opened || step === 0;
}

function advance() {
  if (!opened) {
    opened = true;
    step = 1;
    burstPetals(22);
    render();
    return;
  }

  if (step >= slides.length - 1) {
    step = 0;
    opened = false;
    render();
    return;
  }

  step += 1;
  if (step === slides.length - 1) {
    finaleBurst();
  } else {
    burstPetals(16);
  }
  render();
}

function retreat() {
  if (!opened || step === 0) {
    return;
  }
  step -= 1;
  render();
}

function reset() {
  opened = false;
  step = 0;
  burstPetals(10);
  render();
}

envelopeButton.addEventListener("click", advance);
flowerButton.addEventListener("click", advance);
nextButton.addEventListener("click", advance);
backButton.addEventListener("click", retreat);
resetButton.addEventListener("click", reset);
window.addEventListener("resize", resizeCanvas);
window.visualViewport?.addEventListener("resize", resizeCanvas);

resizeCanvas();
seedPetals();
render();
requestAnimationFrame(animate);
