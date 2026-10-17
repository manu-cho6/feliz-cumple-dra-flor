(() => {
  const canvas = document.getElementById("petalsCanvas");
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0, height = 0, dpr = 1, petals = [], raf = null;
  const colors = ["rgba(222,111,143,.5)", "rgba(246,174,190,.58)", "rgba(255,218,226,.78)", "rgba(191,126,143,.35)"];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = reducedMotion ? 0 : Math.min(24, Math.floor(width / 65));
    petals = Array.from({ length: count }, () => makePetal(true));
    if (!reducedMotion && raf === null) animate();
  }
  function makePetal(initial = false) {
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : -20,
      size: 5 + Math.random() * 8,
      speed: .25 + Math.random() * .65,
      drift: .25 + Math.random() * .65,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * .025,
      rotation: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: .45 + Math.random() * .4
    };
  }
  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size * 1.2, -p.size * .55, p.size * .85, p.size * .8, 0, p.size);
    ctx.bezierCurveTo(-p.size * .85, p.size * .8, -p.size * 1.2, -p.size * .55, 0, -p.size);
    ctx.fill();
    ctx.restore();
  }
  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (const p of petals) {
      p.phase += .012;
      p.x += Math.sin(p.phase) * p.drift * .55;
      p.y += p.speed;
      p.rotation += p.spin;
      if (p.y > height + 24) Object.assign(p, makePetal(false));
      drawPetal(p);
    }
    raf = requestAnimationFrame(animate);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // Aparición suave al entrar en pantalla
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Pequeña lluvia de corazones y destellos al pulsar el botón
  const button = document.getElementById("magicButton");
  button?.addEventListener("click", event => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const symbols = ["♥", "✦", "✿", "♡", "✧"];
    const palette = ["#c84e70", "#e58ca4", "#d8b56b", "#88a98e", "#f5b8c8"];
    for (let i = 0; i < 34; i++) {
      const particle = document.createElement("span");
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const angle = Math.random() * Math.PI * 2;
      const distance = 70 + Math.random() * 180;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 35;
      particle.style.cssText = `
        position:fixed; left:${originX}px; top:${originY}px; z-index:99;
        pointer-events:none; color:${palette[Math.floor(Math.random()*palette.length)]};
        font-size:${12 + Math.random()*19}px; opacity:0; transform:translate(-50%,-50%) scale(.4);
        transition:transform ${700 + Math.random()*650}ms cubic-bezier(.15,.7,.25,1), opacity 900ms ease-out;
      `;
      document.body.appendChild(particle);
      requestAnimationFrame(() => {
        particle.style.opacity = "1";
        particle.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random()*150-75}deg) scale(1)`;
      });
      window.setTimeout(() => {
        particle.style.opacity = "0";
        particle.style.transform += " scale(.4)";
      }, 650);
      window.setTimeout(() => particle.remove(), 1500);
    }
    button.innerHTML = '¡Un deseo bonito para Flor! <span>♥</span>';
    window.setTimeout(() => { button.innerHTML = 'Enviar un poquito de magia <span>✧</span>'; }, 2400);
  });
})();
