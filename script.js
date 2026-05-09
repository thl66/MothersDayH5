const canvas = document.querySelector("#petalCanvas");
const ctx = canvas.getContext("2d");
const petalButton = document.querySelector("#petalButton");
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const letterPage = document.querySelector(".letter-page");
const letterImage = document.querySelector(".letter-page .poster-image");
const letterText = document.querySelector("#letterText");
const letterTypewriter = document.querySelector(".letter-typewriter");
const letterImageSize = {
  width: 1391,
  height: 2896
};
const letterTextBox = {
  x: 228,
  y: 890,
  width: 936,
  height: 530,
  rotate: -2.5
};
const letterContent = [
  "亲爱的妈妈：",
  "  今天是一个特殊的日子，是您的节日——母亲节。",
  "还记得我小时候，我发烧了，您给我做饭，喂我吃药，还",
  "给我讲故事，第二天我就退烧了。还记得每次去餐厅吃饭您都把好吃",
  "的多留些给我。平时，您经常给我检查作业，陪我听英语，给我检查",
  "英语单词，每次考试之前您都和我复习，每次考试的成绩都有您的一",
  "半。",
  "  妈妈您用您的汗水将我养育十年，我十分感激您，将来我长大了",
  "一定会报答您的，今天是母亲节，我祝您：“母亲节快乐”！"
].join("\n");

let petals = [];
let lastTime = 0;
let letterTimer = null;
let letterStarted = false;

function viewport() {
  return {
    width: window.visualViewport?.width || window.innerWidth,
    height: window.visualViewport?.height || window.innerHeight
  };
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const view = viewport();
  canvas.width = Math.floor(view.width * ratio);
  canvas.height = Math.floor(view.height * ratio);
  canvas.style.width = `${view.width}px`;
  canvas.style.height = `${view.height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createPetal(burst = false) {
  const view = viewport();
  return {
    x: burst ? view.width / 2 + (Math.random() - 0.5) * 220 : Math.random() * view.width,
    y: burst ? view.height * 0.48 + (Math.random() - 0.5) * 90 : -30 - Math.random() * 180,
    size: 6 + Math.random() * 12,
    speed: burst ? 1.2 + Math.random() * 2.5 : 0.3 + Math.random() * 0.6,
    drift: (Math.random() - 0.5) * (burst ? 3.5 : 1.2),
    spin: (Math.random() - 0.5) * 0.12,
    angle: Math.random() * Math.PI * 2,
    alpha: burst ? 0.9 : 0.3 + Math.random() * 0.4,
    life: burst ? 120 + Math.random() * 120 : Infinity,
    swing: Math.random() * Math.PI * 2, // 摆动起始角度
    swingSpeed: 0.02 + Math.random() * 0.03 // 摆动速度
  };
}

function seedPetals() {
  petals = Array.from({ length: 24 }, () => createPetal(false));
}

function burstPetals(count = 60) {
  for (let i = 0; i < count; i += 1) {
    petals.push(createPetal(true));
  }
}

function drawPetal(petal) {
  const h = petal.size * 1.8; // 稍微拉长花瓣，更像康乃馨或玫瑰瓣
  const w = petal.size;
  ctx.save();
  ctx.translate(petal.x, petal.y);
  ctx.rotate(petal.angle);
  ctx.globalAlpha = Math.max(0, petal.alpha);

  // 使用更柔和的渐变色
  const gradient = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  gradient.addColorStop(0, "#fff5f7"); // 顶部淡白粉
  gradient.addColorStop(0.4, "#f8a5b9"); // 中间亮粉
  gradient.addColorStop(1, "#e84865"); // 底部深粉

  ctx.fillStyle = gradient;

  // 绘制更具肉感和不规则感的花瓣形状
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  // 右侧曲线
  ctx.bezierCurveTo(w * 0.9, -h * 0.3, w * 0.8, h * 0.3, 0, h / 2);
  // 左侧曲线
  ctx.bezierCurveTo(-w * 0.8, h * 0.3, -w * 0.9, -h * 0.3, 0, -h / 2);
  ctx.fill();

  // 添加一条细微的中脉线，增加立体感
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2 + 2);
  ctx.lineTo(0, h / 2 - 2);
  ctx.stroke();

  ctx.restore();
}

function animate(time) {
  const view = viewport();
  const delta = Math.min((time - lastTime) / 16.67 || 1, 2);
  lastTime = time;
  ctx.clearRect(0, 0, view.width, view.height);

  petals = petals.filter((petal) => {
    // 基础下落和漂移
    petal.y += petal.speed * delta;

    // 使用正弦函数模拟左右摆动，更加自然
    petal.swing += petal.swingSpeed * delta;
    const horizontalSwing = Math.sin(petal.swing) * 0.8;

    petal.x += (horizontalSwing + petal.drift) * delta;
    petal.angle += petal.spin * delta;

    if (petal.life !== Infinity) {
      petal.life -= delta;
      petal.alpha *= 0.993; // 稍微变慢淡出速度
    }

    if (petal.y > view.height + 70 || petal.life <= 0) {
      return false;
    }
    drawPetal(petal);
    return true;
  });

  // 保持屏幕上总有一定数量的花瓣
  while (petals.length < 24) {
    petals.push(createPetal(false));
  }

  requestAnimationFrame(animate);
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.35 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function positionLetterLayer() {
  if (!letterPage || !letterTypewriter) {
    return;
  }

  const pageWidth = letterPage.clientWidth;
  const pageHeight = letterPage.clientHeight;
  const imageRatio = letterImageSize.width / letterImageSize.height;
  const pageRatio = pageWidth / pageHeight;
  let renderedWidth = pageWidth;
  let renderedHeight = pageHeight;

  if (pageRatio > imageRatio) {
    renderedHeight = pageWidth / imageRatio;
  } else {
    renderedWidth = pageHeight * imageRatio;
  }

  const offsetX = (pageWidth - renderedWidth) / 2;
  const offsetY = 0;
  const scale = renderedWidth / letterImageSize.width;
  const left = offsetX + letterTextBox.x * scale;
  const top = offsetY + letterTextBox.y * scale;

  letterTypewriter.style.left = `${left}px`;
  letterTypewriter.style.top = `${top}px`;
  letterTypewriter.style.width = `${letterTextBox.width * scale}px`;
  letterTypewriter.style.height = `${letterTextBox.height * scale}px`;
  letterTypewriter.style.transform = `rotate(${letterTextBox.rotate}deg)`;
  letterTypewriter.style.fontSize = `${Math.max(9, 21 * scale)}px`;
  letterTypewriter.style.lineHeight = "1.75";
}

function typeLetter() {
  if (!letterText || letterStarted) {
    return;
  }

  letterStarted = true;
  letterText.textContent = "";
  letterText.classList.add("is-typing");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    letterText.textContent = letterContent;
    letterText.classList.remove("is-typing");
    return;
  }

  let index = 0;
  const step = () => {
    letterText.textContent = letterContent.slice(0, index);
    index += 1;

    if (index <= letterContent.length) {
      const current = letterContent[index - 2];
      const delay = current === "\n" ? 240 : 72 + Math.random() * 42;
      letterTimer = window.setTimeout(step, delay);
      return;
    }

    letterText.classList.remove("is-typing");
  };

  step();
}

function setupLetterTyping() {
  if (!letterPage || !letterText) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.clearTimeout(letterTimer);
          letterTimer = window.setTimeout(typeLetter, 420);
          return;
        }

        if (!letterStarted) {
          window.clearTimeout(letterTimer);
        }
      });
    },
    { threshold: 0.62 }
  );

  observer.observe(letterPage);
}

petalButton?.addEventListener("click", () => burstPetals(64));
window.addEventListener("resize", resizeCanvas);
window.addEventListener("resize", positionLetterLayer);
window.visualViewport?.addEventListener("resize", resizeCanvas);
window.visualViewport?.addEventListener("resize", positionLetterLayer);
letterImage?.addEventListener("load", positionLetterLayer);

resizeCanvas();
positionLetterLayer();
seedPetals();
setupReveal();
setupLetterTyping();
requestAnimationFrame(animate);
