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

  fft.setInput(song);
  amp.setInput(song);

  for (let i = 0; i < 200; i++) {
    particles.push(new Particle());
  }

  textAlign(CENTER, CENTER);
  textSize(24);
}

function draw() {

  background(0, 40);

  if (!loaded) {
    fill(255);
    text("loading audio...", width/2, height/2);
    return;
  }

  if (!song.isPlaying()) {
    fill(255);
    textSize(40);
    text("dansoutainowarutsu", width/2, height/2 - 40);
    textSize(20);
    text("click to start", width/2, height/2 + 20);
    return;
  }

  let t = song.currentTime();

  let spectrum = fft.analyze();
  let bass = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");
  let treble = fft.getEnergy("treble");
  let level = amp.getLevel();

  // ノイズ背景
  for (let i = 0; i < 60; i++) {
    fill(random(50));
    rect(random(width), random(height), 2, 2);
  }

  push();
  translate(width/2, height/2);

  // ===== セクション制御 =====

  // イントロ
  if (t < 36.1) {
    rotate(frameCount * 0.002);
    stroke(100);
  }

  // Aメロ
  else if (t < 65.01) {
    rotate(frameCount * 0.003);
    stroke(bass, mid, treble);
  }

  // Bメロ
  else if (t < 72.03) {
    rotate(frameCount * 0.01);
    scale(1.01);
  }

  // サビ1
  else if (t < 101.02) {

    rotate(frameCount * 0.02);

    let shake = map(bass, 0, 255, 0, 15);
    translate(random(-shake, shake), random(-shake, shake));

    blendMode(DIFFERENCE);
  }

  // Aメロ2
  else if (t < 115.07) {
    blendMode(BLEND);
    rotate(frameCount * 0.003);
  }

  // Bメロ2
  else if (t < 130.02) {
    rotate(random(-0.02, 0.02));
    scale(1.02);
  }

  // サビ2
  else if (t < 159.00) {

    rotate(frameCount * 0.03);

    let shake = map(bass, 0, 255, 0, 20);
    translate(random(-shake, shake), random(-shake, shake));

    blendMode(DIFFERENCE);
  }

  // Cメロ
  else if (t < 173.05) {
    blendMode(BLEND);
    rotate(frameCount * 0.005);
    scale(0.98);
  }

  // ラスサビ
  else {

    rotate(frameCount * 0.04);

    let shake = map(bass, 0, 255, 0, 30);
    translate(random(-shake, shake), random(-shake, shake));

    blendMode(DIFFERENCE);

    if (treble > 180) {
      fill(random(255), random(255), random(255));
      ellipse(
        random(-width/2, width/2),
        random(-height/2, height/2),
        random(20, 60)
      );
    }
  }

  // ===== 中央円 =====

  noFill();
  strokeWeight(2);

  let size = map(bass, 0, 255, 100, 500);
  ellipse(0, 0, size);

  // ===== 波形リング =====

  beginShape();
  for (let i = 0; i < spectrum.length; i += 10) {

    let angle = map(i, 0, spectrum.length, 0, TWO_PI);
    let r = map(spectrum[i], 0, 255, 150, 400);

    let x = cos(angle) * r;
    let y = sin(angle) * r;

    vertex(x, y);
  }
  endShape(CLOSE);

  // ===== パーティクル =====

  for (let p of particles) {
    p.update(level, treble);
    p.show();
  }

  // キックフラッシュ
  if (bass > 200) {
    fill(255, 40);
    rect(-width/2, -height/2, width, height);
  }

  pop();

  // ===== 下部波形 =====

  stroke(255);
  noFill();

  beginShape();
  for (let i = 0; i < spectrum.length; i++) {

    let x = map(i, 0, spectrum.length, 0, width);
    let y = map(spectrum[i], 0, 255, height, height - 150);

    vertex(x, y);
  }
  endShape();

  // ラストフェード
  if (song.currentTime() > song.duration() - 5) {
    fill(0, 20);
    rect(0, 0, width, height);
  }
}

function mousePressed() {

  userStartAudio();

  if (loaded && !song.isPlaying()) {
    song.play();
  }
}

function touchStarted() {

  userStartAudio();

  if (loaded && !song.isPlaying()) {
    song.play();
  }

  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ===== パーティクル =====

class Particle {

  constructor() {
    this.x = random(-width, width);
    this.y = random(-height, height);
    this.size = random(2, 6);
  }

  update(level, treble) {

    this.x += random(-1, 1) * level * 50;
    this.y += random(-1, 1) * level * 50;

    if (this.x > width) this.x = -width;
    if (this.x < -width) this.x = width;
    if (this.y > height) this.y = -height;
    if (this.y < -height) this.y = height;

    this.size = map(treble, 0, 255, 2, 10);
  }

  show() {
    noStroke();
    fill(255);
    ellipse(this.x, this.y, this.size);
  }
}
