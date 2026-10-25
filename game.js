
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 25, 100);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

// 이동과 카메라
const keys = {};
let angle = 0;
let pitch = 0.3;

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

renderer.domElement.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});

document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === renderer.domElement) {
    angle -= e.movementX * 0.003;
    pitch = THREE.MathUtils.clamp(pitch + e.movementY * 0.002, -0.2, 0.8);
  }
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);
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

  renderer.render(scene, camera);
}

camera.position.set(0, 5, 8);
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
