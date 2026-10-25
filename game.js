
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// 기본 설정
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 25, 100);

const camera = new THREE.PerspectiveCamera(
  70, window.innerWidth / window.innerHeight, 0.1, 200
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

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
  const x = (Math.random() - 0.5) * 90;
  const z = (Math.random() - 0.5) * 90;
  if (Math.abs(x) > 5 || Math.abs(z) > 5) createTree(x, z);
}

// 바위
for (let i = 0; i < 20; i++) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.7),
    new THREE.MeshStandardMaterial({ color: 0x777777 })
  );
  rock.position.set(
    (Math.random() - 0.5) * 70,
    0.5,
    (Math.random() - 0.5) * 70
  );
  rock.castShadow = true;
  scene.add(rock);
}

// 슬라임 몬스터
const slime = new THREE.Group();
scene.add(slime);
slime.position.set(0, 0, 6);

const slimeBody = new THREE.Mesh(
  new THREE.SphereGeometry(0.85, 20, 16),
  new THREE.MeshStandardMaterial({ color: 0x45df62 })
);
slimeBody.scale.set(1, 0.8, 1);
slimeBody.position.y = 0.7;
slimeBody.castShadow = true;
slime.add(slimeBody);

// 슬라임 눈
for (const x of [-0.25, 0.25]) {
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  eye.position.set(x, 0.85, -0.68);
  slime.add(eye);
}

// 슬라임 입
const mouth = new THREE.Mesh(
  new THREE.BoxGeometry(0.22, 0.05, 0.05),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
mouth.position.set(0, 0.59, -0.77);
slime.add(mouth);

// 슬라임 머리 위 체력바
const hpBar = new THREE.Group();
slime.add(hpBar);
hpBar.position.set(0, 2.0, 0);

const hpBackground = new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 0.18),
  new THREE.MeshBasicMaterial({ color: 0x222222 })
);
hpBar.add(hpBackground);

const hpFill = new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 0.14),
  new THREE.MeshBasicMaterial({ color: 0xff3333 })
);
hpFill.position.z = 0.01;
hpBar.add(hpFill);

// 체력바 업데이트
function updateSlimeBar() {
  const ratio = Math.max(0, slimeHP / 60);
  hpFill.scale.x = ratio;
  hpFill.position.x = -0.9 * (1 - ratio);
  hpBar.visible = slimeAlive;
}

let slimeHP = 60;
let slimeAlive = true;
let kills = 0;
let jelly = 0;

// 화면 UI
const hud = document.createElement('div');
hud.style.cssText = `
  position:fixed; top:15px; right:15px;
  background:#222d; color:white; padding:15px;
  border-radius:12px; z-index:5;
  font-family:sans-serif; min-width:160px;
`;
document.body.appendChild(hud);

function updateHUD() {
  hud.innerHTML = `
    <b>⚔️ 전투 정보</b>
    <p>몬스터: 슬라임</p>
    <p>슬라임 체력: ${Math.max(0, slimeHP)} / 60</p>
    <p>처치 수: ${kills}</p>
    <p>슬라임 젤리: ${jelly}개</p>
    <p>무기: 나무 검</p>
  `;
}
updateHUD();
updateSlimeBar();
// 조작
const keys = {};
let angle = 0;
let pitch = 0.3;

window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

renderer.domElement.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});

// 검 공격
let attacking = false;
let attackTime = 0;
let attackCooldown = 0;
let hasHit = false;

function attack() {
  if (attacking || attackCooldown > 0) return;

  attacking = true;
  attackTime = 0;
  attackCooldown = 0.55;
  hasHit = false;
}

renderer.domElement.addEventListener('mousedown', e => {
  if (e.button === 0) attack();
});

document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === renderer.domElement) {
    angle -= e.movementX * 0.003;
    pitch = THREE.MathUtils.clamp(
      pitch + e.movementY * 0.002, -0.2, 0.8
    );
  }
});

// 몬스터 처치 및 재생성
function defeatSlime() {
  slimeAlive = false;
  slime.visible = false;
  kills++;
  jelly += 3;
  updateHUD();

  setTimeout(() => {
    slimeHP = 60;
    slimeAlive = true;
    slime.visible = true;
    updateSlimeBar();
    slime.position.set(
      player.position.x + 2,
      0,
      player.position.z + 6
    );
    updateHUD();
  }, 3000);
}

// 게임 실행
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);

  // 이동
  let forward = 0;
  let side = 0;

  if (keys['w']) forward += 1;
  if (keys['s']) forward -= 1;
  if (keys['a']) side -= 1;
  if (keys['d']) side += 1;

  const move = new THREE.Vector3(side, 0, forward);

  if (move.length() > 0) {
    move.normalize();
    move.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

    player.position.addScaledVector(move, 8 * dt);
    player.rotation.y = Math.atan2(move.x, move.z);
  }

  // 공격 애니메이션
  if (attacking) {
    attackTime += dt;
    const progress = Math.min(attackTime / 0.35, 1);

    sword.rotation.x = -1.5 + Math.sin(progress * Math.PI) * 2.8;
    sword.rotation.z = Math.sin(progress * Math.PI) * 0.5;

    // 공격 판정
    if (progress > 0.25 && progress < 0.7 && !hasHit) {
      const distance = player.position.distanceTo(slime.position);
      const direction = new THREE.Vector3(
        Math.sin(player.rotation.y), 0,
        Math.cos(player.rotation.y)
      );
      const toSlime = new THREE.Vector3()
        .subVectors(slime.position, player.position)
        .setY(0)
        .normalize();

      const facing = direction.dot(toSlime);

      if (slimeAlive && distance < 3.5 && facing > 0.2) {
        slimeHP -= 25;
        hasHit = true;
        updateSlimeBar();
        if (slimeHP <= 0) {
          slimeHP = 0;
          defeatSlime();
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

  // 카메라
  const distance = 7;
  const height = 3 + pitch * 3;

  camera.position.set(
    player.position.x - Math.sin(angle) * distance,
    player.position.y + height,
    player.position.z - Math.cos(angle) * distance
  );

  camera.lookAt(
    player.position.x,
    player.position.y + 1.2,
    player.position.z
  );
  hpBar.quaternion.copy(camera.quaternion);

  renderer.render(scene, camera);
}

animate();

// 화면 크기 변경
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
