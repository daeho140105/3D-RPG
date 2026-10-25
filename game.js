import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// ================================
// 기본 설정
// ================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ================================
// 빛
// ================================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(50, 100, 50);
sun.castShadow = true;
scene.add(sun);

// ================================
// 월드
// ================================

const WORLD_SIZE = 200;
const WORLD_LIMIT = 95;

// 바닥
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE),
  new THREE.MeshStandardMaterial({
    color: 0x5fa64b
  })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ================================
// 고정된 월드용 랜덤
// 새로고침해도 같은 결과가 나오게 함
// ================================

let worldSeed = 123456;

function seededRandom() {
  worldSeed = (worldSeed * 9301 + 49297) % 233280;
  return worldSeed / 233280;
}

// ================================
// 나무
// ================================

function createTree(x, z) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.45, 2.5, 8),
    new THREE.MeshStandardMaterial({
      color: 0x704214
    })
  );

  trunk.position.y = 1.25;
  trunk.castShadow = true;
  tree.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0x248f24
    })
  );

  leaves.position.y = 3.1;
  leaves.castShadow = true;
  tree.add(leaves);

  tree.position.set(x, 0, z);
  scene.add(tree);
}

// ================================
// 바위
// ================================

function createRock(x, z) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({
      color: 0x777777
    })
  );

  rock.position.set(x, 0.7, z);
  rock.scale.set(1.2, 0.8, 1);
  rock.castShadow = true;

  scene.add(rock);
}

// ================================
// 고정된 월드 생성
// ================================

for (let i = 0; i < 35; i++) {
  let x = (seededRandom() - 0.5) * 180;
  let z = (seededRandom() - 0.5) * 180;

  // 시작 위치 주변은 비워둔다
  if (Math.abs(x) < 12 && Math.abs(z) < 12) {
    x += 20;
    z += 20;
  }

  createTree(x, z);
}

for (let i = 0; i < 25; i++) {
  let x = (seededRandom() - 0.5) * 180;
  let z = (seededRandom() - 0.5) * 180;

  createRock(x, z);
}

// ================================
// 플레이어
// ================================

const player = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1.5, 0.7),
  new THREE.MeshStandardMaterial({
    color: 0x3366ff
  })
);

body.position.y = 1.5;
body.castShadow = true;
player.add(body);

const head = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 0.8, 0.8),
  new THREE.MeshStandardMaterial({
    color: 0xffcc99
  })
);

head.position.y = 2.65;
head.castShadow = true;
player.add(head);

const leftArm = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 1.2, 0.3),
  new THREE.MeshStandardMaterial({
    color: 0x3366ff
  })
);

leftArm.position.set(-0.65, 1.5, 0);
leftArm.castShadow = true;
player.add(leftArm);

const rightArm = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 1.2, 0.3),
  new THREE.MeshStandardMaterial({
    color: 0x3366ff
  })
);

rightArm.position.set(0.65, 1.5, 0);
rightArm.castShadow = true;
player.add(rightArm);

const leftLeg = new THREE.Mesh(
  new THREE.BoxGeometry(0.35, 1, 0.35),
  new THREE.MeshStandardMaterial({
    color: 0x222222
  })
);

leftLeg.position.set(-0.25, 0.5, 0);
leftLeg.castShadow = true;
player.add(leftLeg);

const rightLeg = new THREE.Mesh(
  new THREE.BoxGeometry(0.35, 1, 0.35),
  new THREE.MeshStandardMaterial({
    color: 0x222222
  })
);

rightLeg.position.set(0.25, 0.5, 0);
rightLeg.castShadow = true;
player.add(rightLeg);

player.position.set(0, 0, 0);

scene.add(player);

// ================================
// 검
// ================================

const sword = new THREE.Group();

const blade = new THREE.Mesh(
  new THREE.BoxGeometry(0.18, 1.8, 0.08),
  new THREE.MeshStandardMaterial({
    color: 0xd8d8d8,
    metalness: 0.7,
    roughness: 0.3
  })
);

blade.position.y = 0.9;
sword.add(blade);

const guard = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.12, 0.12),
  new THREE.MeshStandardMaterial({
    color: 0x222222
  })
);

guard.position.y = 0.05;
sword.add(guard);

const handle = new THREE.Mesh(
  new THREE.BoxGeometry(0.12, 0.6, 0.12),
  new THREE.MeshStandardMaterial({
    color: 0x6b3e1e
  })
);

handle.position.y = -0.3;
sword.add(handle);

sword.position.set(0.8, 1.3, 0.2);
player.add(sword);

// ================================
// 플레이어 상태
// ================================

let playerHP = 100;
const playerMaxHP = 100;

let keys = {};

let attackCooldown = 0;
let attackAnimation = 0;

const PLAYER_SPEED = 8;
const ATTACK_DAMAGE = 25;
const ATTACK_RANGE = 3.5;

// ================================
// 키보드
// ================================

window.addEventListener('keydown', (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});

// ================================
// 슬라임
// ================================

const slimes = [];

const MAX_SLIMES = 10;
const SLIME_MAX_HP = 60;

function createHPBar() {
  const hpBar = new THREE.Group();

  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.18),
    new THREE.MeshBasicMaterial({
      color: 0x222222
    })
  );

  hpBar.add(background);

  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.14),
    new THREE.MeshBasicMaterial({
      color: 0xff3333
    })
  );

  fill.position.z = 0.01;
  hpBar.add(fill);

  hpBar.userData.fill = fill;

  return hpBar;
}

function createSlime(x, z) {
  const slime = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0x35d05b
    })
  );

  body.scale.set(1, 0.8, 1);
  body.position.y = 0.9;
  body.castShadow = true;

  slime.add(body);

  // 왼쪽 눈
  const leftEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0x000000
    })
  );

  leftEye.position.set(-0.3, 1.15, -0.8);
  slime.add(leftEye);

  // 오른쪽 눈
  const rightEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0x000000
    })
  );

  rightEye.position.set(0.3, 1.15, -0.8);
  slime.add(rightEye);

  // 체력바
  const hpBar = createHPBar();

  hpBar.position.set(0, 2.2, 0);

  slime.add(hpBar);

  slime.position.set(x, 0, z);

  slime.userData.hp = SLIME_MAX_HP;
  slime.userData.alive = true;
  slime.userData.attackCooldown = Math.random();
  slime.userData.hpBar = hpBar;

  scene.add(slime);

  slimes.push(slime);

  updateSlimeHPBar(slime);

  return slime;
}

// ================================
// 슬라임 랜덤 위치
// ================================

function getRandomWorldPosition() {
  let x;
  let z;

  do {
    x = (Math.random() - 0.5) * 180;
    z = (Math.random() - 0.5) * 180;
  } while (
    Math.sqrt(x * x + z * z) < 12
  );

  return {
    x,
    z
  };
}

// ================================
// 슬라임 체력바
// ================================

function updateSlimeHPBar(slime) {
  const hp = Math.max(0, slime.userData.hp);
  const ratio = hp / SLIME_MAX_HP;

  const fill = slime.userData.hpBar.userData.fill;

  fill.scale.x = ratio;
  fill.position.x = -0.9 * (1 - ratio);

  slime.userData.hpBar.visible = slime.userData.alive;
}

// ================================
// 처음부터 최대 10마리 생성
// ================================

for (let i = 0; i < MAX_SLIMES; i++) {
  const position = getRandomWorldPosition();

  createSlime(
    position.x,
    position.z
  );
}

// ================================
// 슬라임 처치
// ================================

function defeatSlime(slime) {
  slime.userData.alive = false;
  slime.userData.hp = 0;

  slime.visible = false;

  updateSlimeHPBar(slime);

  // 3초 후 월드의 랜덤 위치에서 부활
  setTimeout(() => {
    const position = getRandomWorldPosition();

    slime.position.set(
      position.x,
      0,
      position.z
    );

    slime.userData.hp = SLIME_MAX_HP;
    slime.userData.alive = true;
    slime.userData.attackCooldown = 1;

    slime.visible = true;

    updateSlimeHPBar(slime);
  }, 3000);
}

// ================================
// 슬라임 공격
// ================================

function updateSlimes(dt) {
  for (const slime of slimes) {
    if (!slime.userData.alive) {
      continue;
    }

    // 플레이어 방향
    const direction = new THREE.Vector3();

    direction.subVectors(
      player.position,
      slime.position
    );

    direction.y = 0;

    const distance = direction.length();

    // 플레이어가 가까우면 따라옴
    if (distance > 2) {
      direction.normalize();

      slime.position.addScaledVector(
        direction,
        1.8 * dt
      );
    }

    // 공격 쿨다운
    slime.userData.attackCooldown -= dt;

    // 플레이어 공격
    if (
      distance <= 2 &&
      slime.userData.attackCooldown <= 0
    ) {
      playerHP = Math.max(
        0,
        playerHP - 10
      );

      slime.userData.attackCooldown = 1;

      updateHUD();

      if (playerHP <= 0) {
        playerHP = 100;

        player.position.set(
          0,
          0,
          0
        );

        updateHUD();
      }
    }

    // 슬라임도 월드 밖으로 못 나감
    slime.position.x = THREE.MathUtils.clamp(
      slime.position.x,
      -WORLD_LIMIT,
      WORLD_LIMIT
    );

    slime.position.z = THREE.MathUtils.clamp(
      slime.position.z,
      -WORLD_LIMIT,
      WORLD_LIMIT
    );
  }
}

// ================================
// 공격
// ================================

window.addEventListener('mousedown', (event) => {
  if (event.button !== 0) {
    return;
  }

  if (attackCooldown > 0) {
    return;
  }

  attackCooldown = 0.55;
  attackAnimation = 0.35;

  const playerForward = new THREE.Vector3(
    0,
    0,
    1
  );

  playerForward.applyQuaternion(
    player.quaternion
  );

  for (const slime of slimes) {
    if (!slime.userData.alive) {
      continue;
    }

    const direction = new THREE.Vector3();

    direction.subVectors(
      slime.position,
      player.position
    );

    direction.y = 0;

    const distance = direction.length();

    if (distance > ATTACK_RANGE) {
      continue;
    }

    direction.normalize();

    const dot = playerForward.dot(direction);

    if (dot > 0.2) {
      slime.userData.hp -= ATTACK_DAMAGE;

      updateSlimeHPBar(slime);

      if (slime.userData.hp <= 0) {
        defeatSlime(slime);
      }
    }
  }
});

// ================================
// HUD
// ================================

function updateHUD() {
  let hud = document.getElementById('gameHUD');

  if (!hud) {
    hud = document.createElement('div');

    hud.id = 'gameHUD';

    hud.style.position = 'fixed';
    hud.style.top = '20px';
    hud.style.right = '20px';
    hud.style.padding = '15px';
    hud.style.background = 'rgba(0,0,0,0.65)';
    hud.style.color = 'white';
    hud.style.fontFamily = 'Arial';
    hud.style.fontSize = '16px';
    hud.style.borderRadius = '10px';
    hud.style.zIndex = '100';

    document.body.appendChild(hud);
  }

  hud.innerHTML = `
    <b>⚔️ 대장장이의 모험</b>
    <p>레벨: 1</p>
    <p>❤️ 플레이어 체력: ${playerHP} / ${playerMaxHP}</p>
    <p>⚔️ 무기: 나무 검</p>
    <p>🟢 슬라임: ${slimes.filter(s => s.userData.alive).length} / ${MAX_SLIMES}</p>
    <p>WASD: 이동</p>
    <p>마우스: 카메라</p>
    <p>좌클릭: 공격</p>
  `;
}

updateHUD();

// ================================
// 카메라
// ================================

let cameraAngle = 0;
let cameraPitch = 0.45;

let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

renderer.domElement.addEventListener(
  'mousedown',
  (event) => {
    if (event.button === 2) {
      mouseDown = true;

      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }
  }
);

window.addEventListener(
  'mouseup',
  (event) => {
    if (event.button === 2) {
      mouseDown = false;
    }
  }
);

window.addEventListener(
  'mousemove',
  (event) => {
    if (!mouseDown) {
      return;
    }

    const dx =
      event.clientX - lastMouseX;

    const dy =
      event.clientY - lastMouseY;

    cameraAngle -= dx * 0.005;

    cameraPitch -= dy * 0.005;

    cameraPitch = THREE.MathUtils.clamp(
      cameraPitch,
      0.2,
      1.0
    );

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  }
);

renderer.domElement.addEventListener(
  'contextmenu',
  (event) => {
    event.preventDefault();
  }
);

// ================================
// 게임 업데이트
// ================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(
    clock.getDelta(),
    0.05
  );

  // ----------------------------
  // 플레이어 이동
  // ----------------------------

  const move = new THREE.Vector3();

  if (keys['w']) {
    move.z -= 1;
  }

  if (keys['s']) {
    move.z += 1;
  }

  if (keys['a']) {
    move.x -= 1;
  }

  if (keys['d']) {
    move.x += 1;
  }

  if (move.length() > 0) {
    move.normalize();

    player.position.addScaledVector(
      move,
      PLAYER_SPEED * dt
    );

    player.rotation.y =
      Math.atan2(move.x, move.z);
  }

  // ----------------------------
  // 월드 경계
  // ----------------------------

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -WORLD_LIMIT,
      WORLD_LIMIT
    );

  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -WORLD_LIMIT,
      WORLD_LIMIT
    );

  // ----------------------------
  // 공격
  // ----------------------------

  attackCooldown = Math.max(
    0,
    attackCooldown - dt
  );

  if (attackAnimation > 0) {
    attackAnimation -= dt;

    sword.rotation.z =
      Math.sin(
        (attackAnimation / 0.35) *
        Math.PI
      ) * 1.5;
  } else {
    sword.rotation.z = 0;
  }

  // ----------------------------
  // 슬라임
  // ----------------------------

  updateSlimes(dt);

  // ----------------------------
  // 체력바가 카메라를 바라보게
  // ----------------------------

  for (const slime of slimes) {
    slime.userData.hpBar.quaternion.copy(
      camera.quaternion
    );
  }

  // ----------------------------
  // 카메라
  // ----------------------------

  const cameraDistance = 10;

  const cameraX =
    player.position.x +
    Math.sin(cameraAngle) *
    cameraDistance;

  const cameraZ =
    player.position.z +
    Math.cos(cameraAngle) *
    cameraDistance;

  const cameraY =
    player.position.y +
    6;

  camera.position.set(
    cameraX,
    cameraY,
    cameraZ
  );

  camera.lookAt(
    player.position.x,
    player.position.y + 1,
    player.position.z
  );

  renderer.render(
    scene,
    camera
  );
}

animate();

// ================================
// 화면 크기 변경
// ================================

window.addEventListener(
  'resize',
  () => {
    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
);
