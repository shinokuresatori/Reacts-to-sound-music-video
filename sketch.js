let song;
let fft;
let amp;

let particles = [];
let loaded = false;

function preload() {
  song = loadSound(
    "dansoutainowarutsu.mp3",
    () => {
      loaded = true;
      console.log("audio loaded");
    },
    () => {
      console.log("audio load failed");
    }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  fft = new p5.FFT(0.9, 1024);
  amp = new p5.Amplitude();

  for (let i = 0; i < 150; i++) {
    particles.push(new Particle());
  }

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(24);
}

function draw() {

  background(0, 30);

  if (!loaded) {
    text("loading audio...", width/2, height/2);
    return;
  }

  if (!song.isPlaying()) {
    text("click to start", width / 2, height / 2);
    return;
  }

  let spectrum = fft.analyze();

  let bass = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");
  let treble = fft.getEnergy("treble");

  let level = amp.getLevel();

  translate(width / 2, height / 2);

  noFill();
  stroke(bass, mid, treble);
  strokeWeight(2);

  let size = map(bass, 0, 255, 100, 500);
  ellipse(0, 0, size);

  beginShape();
  for (let i = 0; i < spectrum.length; i += 10) {

    let angle = map(i, 0, spectrum.length, 0, TWO_PI);
    let r = map(spectrum[i], 0, 255, 150, 400);

    let x = cos(angle) * r;
    let y = sin(angle) * r;

    vertex(x, y);
  }
  endShape(CLOSE);

  for (let p of particles) {
    p.update(level, treble);
    p.show();
  }

  if (bass > 200) {
    fill(255, 40);
    rect(-width / 2, -height / 2, width, height);
  }
}

function mousePressed() {

  userStartAudio();

  if (loaded && !song.isPlaying()) {
    song.play();
  }
}
