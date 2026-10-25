
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// 화면 설정
let viewport = document.querySelector('meta[name="viewport"]');
if (!viewport) {
  viewport = document.createElement('meta');
  viewport.name = 'viewport';
  document.head.appendChild(viewport);
}
viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.touchAction = 'none';
document.body.style.userSelect = 'none';

const isMobile = window.matchMedia('(pointer: coarse)').matches;

// 기본 설정
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 35, 120);

const camera = new THREE.PerspectiveCamera(
  70, window.innerWidth / window.innerHeight, 0.1, 250
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.domElement.style.display = 'block';
renderer.domElement.style.touchAction = 'none';
document.body.appendChild(renderer.domElement);

// 고정 월드 랜덤
let seed = 123456;

function random() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

// 조명
scene.add(new THREE.HemisphereLight(0xffffff, 0x557744, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(20, 30, 10);
sun.castShadow = true;
scene.add(sun);

// 바닥
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x70b84f })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 월드 경계
const boundaryMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });

function createBoundary(x, z, width, depth) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(width, 3, depth),
    boundaryMaterial
  );
  wall.position.set(x, 1.5, z);
  scene.add(wall);
}

createBoundary(0, -99, 200, 2);
createBoundary(0, 99, 200, 2);
createBoundary(-99, 0, 2, 200);
createBoundary(99, 0, 2, 200);

// 캐릭터
const player = new THREE.Group();
scene.add(player);

function makePart(parent, size, color, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

makePart(player, [0.8, 1, 0.45], 0x2875d0, 0, 1.1, 0);
makePart(player, [0.65, 0.65, 0.65], 0xffcc99, 0, 1.95, 0);
makePart(player, [0.25, 0.9, 0.3], 0xffcc99, -0.55, 1.1, 0);
makePart(player, [0.25, 0.9, 0.3], 0xffcc99, 0.55, 1.1, 0);
makePart(player, [0.3, 0.7, 0.3], 0x333344, -0.22, 0.35, 0);
makePart(player, [0.3, 0.7, 0.3], 0x333344, 0.22, 0.35, 0);

// 플레이어 체력
let playerHP = 100;
let playerAlive = true;

// 플레이어 머리 위 체력바
const playerHPBar = new THREE.Group();
player.add(playerHPBar);
playerHPBar.position.set(0, 2.8, 0);

const playerHPBackground = new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 0.18),
  new THREE.MeshBasicMaterial({ color: 0x222222 })
);
playerHPBar.add(playerHPBackground);

const playerHPFill = new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 0.14),
  new THREE.MeshBasicMaterial({ color: 0x35dd55 })
);
playerHPFill.position.z = 0.01;
playerHPBar.add(playerHPFill);

function updatePlayerBar() {
  const ratio = Math.max(0, playerHP / 100);
  playerHPFill.scale.x = ratio;
  playerHPFill.position.x = -0.9 * (1 - ratio);
}

// 나무 검
const sword = new THREE.Group();
player.add(sword);
sword.position.set(0.75, 1.15, 0.15);

makePart(sword, [0.14, 0.8, 0.12], 0xaaaaaa, 0, 0.5, 0);
makePart(sword, [0.3, 0.1, 0.15], 0x8b5a2b, 0, 0.05, 0);
makePart(sword, [0.12, 0.35, 0.12], 0x79502b, 0, -0.17, 0);

// 나무
function createTree(x, z) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 2),
    new THREE.MeshStandardMaterial({ color: 0x79502b })
  );
  trunk.position.y = 1;
  trunk.castShadow = true;
  tree.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 3, 7),
    new THREE.MeshStandardMaterial({ color: 0x238b45 })
  );
  leaves.position.y = 3;
  leaves.castShadow = true;
  tree.add(leaves);

  tree.position.set(x, 0, z);
  scene.add(tree);
}

for (let i = 0; i < 45; i++) {
  const x = (random() - 0.5) * 90;
  const z = (random() - 0.5) * 90;

  if (Math.abs(x) > 5 || Math.abs(z) > 5) {
    createTree(x, z);
  }
}

// 바위
for (let i = 0; i < 20; i++) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.6 + random() * 0.7),
    new THREE.MeshStandardMaterial({ color: 0x777777 })
  );
  rock.position.set(
    (random() - 0.5) * 70,
    0.5,
    (random() - 0.5) * 70
  );
  rock.castShadow = true;
  scene.add(rock);
}

// 슬라임 설정
const MAX_SLIMES = 10;
const slimes = [];
let kills = 0;
let jelly = 0;

function getRandomSpawnPosition() {
  return new THREE.Vector3(
    (random() - 0.5) * 170,
    0,
    (random() - 0.5) * 170
  );
}

// 슬라임 생성
function createSlime() {
  const slime = new THREE.Group();
  scene.add(slime);
  slime.position.copy(getRandomSpawnPosition());

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 20, 16),
    new THREE.MeshStandardMaterial({ color: 0x45df62 })
  );
  body.scale.set(1, 0.8, 1);
  body.position.y = 0.7;
  body.castShadow = true;
  slime.add(body);

  for (const x of [-0.25, 0.25]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    eye.position.set(x, 0.85, -0.68);
    slime.add(eye);
  }

  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.05, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  mouth.position.set(0, 0.59, -0.77);
  slime.add(mouth);

  // 슬라임 체력바
  const hpBar = new THREE.Group();
  slime.add(hpBar);
  hpBar.position.set(0, 2, 0);

  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.18),
    new THREE.MeshBasicMaterial({ color: 0x222222 })
  );
  hpBar.add(background);

  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.14),
    new THREE.MeshBasicMaterial({ color: 0xff3333 })
  );
  fill.position.z = 0.01;
  hpBar.add(fill);

  return {
    group: slime,
    hpBar,
    hpFill: fill,
    hp: 60,
    alive: true,
    aggro: false,
    attackCooldown: 0
  };
}

for (let i = 0; i < MAX_SLIMES; i++) {
  slimes.push(createSlime());
}

function updateSlimeBar(slime) {
  const ratio = Math.max(0, slime.hp / 60);
  slime.hpFill.scale.x = ratio;
  slime.hpFill.position.x = -0.9 * (1 - ratio);

  // 살아 있는 슬라임의 체력바는 계속 표시
  slime.hpBar.visible = slime.alive;
}

// HUD
const hud = document.createElement('div');
hud.style.cssText = `
  position:fixed;
  top:15px;
  right:15px;
  background:#222d;
  color:white;
  padding:15px;
  border-radius:12px;
  z-index:5;
  font-family:sans-serif;
  min-width:160px;
  font-size:14px;
  pointer-events:none;
`;
document.body.appendChild(hud);

function updateHUD() {
  const aliveCount = slimes.filter(s => s.alive).length;

  hud.innerHTML = `
    <b>⚔️ 전투 정보</b>
    <p>플레이어 체력: ${playerHP} / 100</p>
    <div style="width:160px;height:12px;background:#555;border-radius:8px;overflow:hidden">
      <div style="width:${playerHP}%;height:100%;background:#35d45b"></div>
    </div>
    <p>슬라임 생존 수: ${aliveCount} / 10</p>
    <p>처치 수: ${kills}</p>
    <p>슬라임 젤리: ${jelly}개</p>
    <p>무기: 나무 검</p>
    ${playerAlive ? '' : '<h3 style="color:#ff5555">체력이 모두 소진되었습니다!</h3>'}
  `;
}

updateHUD();
updatePlayerBar();

// 키보드와 카메라
const keys = {};
let angle = 0;
let pitch = 0.3;

window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

// PC 마우스 고정
renderer.domElement.addEventListener('click', () => {
  if (!isMobile && document.pointerLockElement !== renderer.domElement) {
    renderer.domElement.requestPointerLock();
  }
});

// PC 마우스 카메라 회전
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === renderer.domElement) {
    angle -= e.movementX * 0.003;
    pitch = THREE.MathUtils.clamp(
      pitch + e.movementY * 0.002,
      -0.2,
      0.8
    );
  }
});

// 공격
let attacking = false;
let attackTime = 0;
let attackCooldown = 0;
let hasHit = false;

function attack() {
  if (!playerAlive || attacking || attackCooldown > 0) return;
  attacking = true;
  attackTime = 0;
  attackCooldown = 0.55;
  hasHit = false;
}

// PC 좌클릭 공격
renderer.domElement.addEventListener('mousedown', e => {
  if (!isMobile && e.button === 0) {
    attack();
  }
});

// 슬라임 처치 및 재소환
function defeatSlime(slime) {
  slime.alive = false;
  slime.aggro = false;
  slime.group.visible = false;
  slime.hpBar.visible = false;

  kills++;
  jelly += 3;
  updateHUD();

  setTimeout(() => {
    slime.hp = 60;
    slime.alive = true;
    slime.aggro = false;
    slime.attackCooldown = 0;
    slime.group.position.copy(getRandomSpawnPosition());
    slime.group.visible = true;

    updateSlimeBar(slime);
    updateHUD();
  }, 3000);
}

// 모바일 조이스틱
const joystickBase = document.createElement('div');
joystickBase.style.cssText = `
  position:fixed;
  left:25px;
  bottom:30px;
  width:130px;
  height:130px;
  border-radius:50%;
  background:#ffffff55;
  border:3px solid #ffffffaa;
  z-index:10;
  display:none;
  touch-action:none;
`;

const joystickKnob = document.createElement('div');
joystickKnob.style.cssText = `
  position:absolute;
  width:55px;
  height:55px;
  left:37px;
  top:37px;
  border-radius:50%;
  background:#ffffffcc;
  border:2px solid #777;
`;

joystickBase.appendChild(joystickKnob);
document.body.appendChild(joystickBase);

// 모바일 공격 버튼
const attackButton = document.createElement('button');
attackButton.textContent = '⚔️ 공격';
attackButton.style.cssText = `
  position:fixed;
  right:30px;
  bottom:45px;
  width:95px;
  height:95px;
  border-radius:50%;
  border:3px solid white;
  background:#d94b35dd;
  color:white;
  font-size:19px;
  font-weight:bold;
  z-index:10;
  display:none;
  touch-action:none;
`;
document.body.appendChild(attackButton);

if (isMobile) {
  joystickBase.style.display = 'block';
  attackButton.style.display = 'block';
}

let joystickX = 0;
let joystickY = 0;
let joystickPointer = null;

joystickBase.addEventListener('pointerdown', e => {
  e.preventDefault();
  joystickPointer = e.pointerId;
  joystickBase.setPointerCapture(e.pointerId);
});

joystickBase.addEventListener('pointermove', e => {
  if (e.pointerId !== joystickPointer) return;
  e.preventDefault();

  const rect = joystickBase.getBoundingClientRect();
  let x = e.clientX - (rect.left + rect.width / 2);
  let y = e.clientY - (rect.top + rect.height / 2);

  const maxDistance = 42;
  const length = Math.sqrt(x * x + y * y);

  if (length > maxDistance) {
    x = x / length * maxDistance;
    y = y / length * maxDistance;
  }

  joystickX = x / maxDistance;
  joystickY = y / maxDistance;
  joystickKnob.style.left = `${37 + x}px`;
  joystickKnob.style.top = `${37 + y}px`;
});

function resetJoystick() {
  joystickPointer = null;
  joystickX = 0;
  joystickY = 0;
  joystickKnob.style.left = '37px';
  joystickKnob.style.top = '37px';
}

joystickBase.addEventListener('pointerup', resetJoystick);
joystickBase.addEventListener('pointercancel', resetJoystick);

attackButton.addEventListener('pointerdown', e => {
  e.preventDefault();
  attack();
});

// 모바일 카메라 드래그
let cameraPointer = null;
let lastTouchX = 0;
let lastTouchY = 0;

renderer.domElement.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'touch') return;

  cameraPointer = e.pointerId;
  lastTouchX = e.clientX;
  lastTouchY = e.clientY;
  renderer.domElement.setPointerCapture(e.pointerId);
});

renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType !== 'touch' || e.pointerId !== cameraPointer) return;

  const dx = e.clientX - lastTouchX;
  const dy = e.clientY - lastTouchY;

  angle -= dx * 0.006;
  pitch = THREE.MathUtils.clamp(
    pitch + dy * 0.004,
    -0.2,
    0.8
  );

  lastTouchX = e.clientX;
  lastTouchY = e.clientY;
});

function resetCameraTouch(e) {
  if (e.pointerId === cameraPointer) {
    cameraPointer = null;
  }
}

renderer.domElement.addEventListener('pointerup', resetCameraTouch);
renderer.domElement.addEventListener('pointercancel', resetCameraTouch);

// 체력바 카메라 방향 맞추기
function faceHealthBar(parent, bar) {
  const parentQuaternion = new THREE.Quaternion();
  parent.getWorldQuaternion(parentQuaternion);
  parentQuaternion.invert();

  bar.quaternion.copy(
    parentQuaternion.multiply(camera.quaternion)
  );
}

// 게임 실행
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  // 이동
  let forward = 0;
  let side = 0;

  if (playerAlive) {
    if (keys['w']) forward += 1;
    if (keys['s']) forward -= 1;
    if (keys['a']) side -= 1;
    if (keys['d']) side += 1;

    if (isMobile) {
      side += joystickX;
      forward -= joystickY;
    }
  }

  const move = new THREE.Vector3(side, 0, forward);

  if (move.length() > 1) move.normalize();

  if (move.length() > 0) {
    move.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      angle
    );
    player.position.addScaledVector(move, 8 * dt);
  }

  player.rotation.y = angle;

  // 월드 경계
  player.position.x = THREE.MathUtils.clamp(player.position.x, -95, 95);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -95, 95);

  // 검 공격 애니메이션
  if (attacking) {
    attackTime += dt;
    const progress = Math.min(attackTime / 0.35, 1);

    sword.rotation.x = -1.5 + Math.sin(progress * Math.PI) * 2.8;
    sword.rotation.z = Math.sin(progress * Math.PI) * 0.5;

    if (progress > 0.25 && progress < 0.7 && !hasHit) {
      let target = null;
      let closestDistance = 3.5;

      const direction = new THREE.Vector3(
        Math.sin(player.rotation.y),
        0,
        Math.cos(player.rotation.y)
      );

      for (const slime of slimes) {
        if (!slime.alive) continue;

        const distance = player.position.distanceTo(slime.group.position);

        const toSlime = new THREE.Vector3()
          .subVectors(slime.group.position, player.position)
          .setY(0)
          .normalize();

        const facing = direction.dot(toSlime);

        if (distance < closestDistance && facing > 0.2) {
          closestDistance = distance;
          target = slime;
        }
      }

      if (target) {
        target.hp -= 25;
        target.aggro = true;
        hasHit = true;

        updateSlimeBar(target);

        if (target.hp <= 0) {
          target.hp = 0;
          defeatSlime(target);
        }

        updateHUD();
      }
    }

    if (progress >= 1) {
      attacking = false;
      sword.rotation.x = 0;
      sword.rotation.z = 0;
    }
  }

  attackCooldown = Math.max(0, attackCooldown - dt);

  // 슬라임 행동
  for (const slime of slimes) {
    if (!slime.alive) continue;

    // 살아 있는 동안 체력바 표시 유지
    slime.hpBar.visible = true;

    if (!slime.aggro) continue;

    slime.attackCooldown = Math.max(0, slime.attackCooldown - dt);

    const toPlayer = new THREE.Vector3()
      .subVectors(player.position, slime.group.position);

    toPlayer.y = 0;
    const distance = toPlayer.length();

    if (distance > 1.5) {
      toPlayer.normalize();
      slime.group.position.addScaledVector(toPlayer, 1.6 * dt);

      slime.group.rotation.y = Math.atan2(
        -toPlayer.x,
        -toPlayer.z
      );
    } else if (playerAlive && slime.attackCooldown <= 0) {
      playerHP = Math.max(0, playerHP - 3);
      slime.attackCooldown = 1.5;

      updatePlayerBar();

      if (playerHP <= 0) {
        playerHP = 0;
        playerAlive = false;
        document.exitPointerLock();
        updatePlayerBar();
      }

      updateHUD();
    }
  }

  // 카메라
  const cameraDistance = 7;
  const height = 3 + pitch * 3;

  camera.position.set(
    player.position.x - Math.sin(angle) * cameraDistance,
    player.position.y + height,
    player.position.z - Math.cos(angle) * cameraDistance
  );

  camera.lookAt(
    player.position.x,
    player.position.y + 1.2,
    player.position.z
  );

  // 체력바가 카메라를 바라보게 함
  faceHealthBar(player, playerHPBar);

  for (const slime of slimes) {
    faceHealthBar(slime.group, slime.hpBar);
  }

  renderer.render(scene, camera);
}

animate();

// 화면 크기 변경
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
