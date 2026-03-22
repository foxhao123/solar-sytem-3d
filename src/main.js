import * as THREE from 'three';
import { createScene, MOON_DATA } from './scene.js';
import { SUN, PLANETS } from './planets.js';
import './style.css';

const canvas = document.getElementById('canvas');
const {
  scene, camera, renderer, controls,
  planetObjects, sunMesh, earthMesh, moonGroup, moonPivot, moonMesh,
} = createScene(canvas);

// ── 速度控制 ────────────────────────────────────────────
let speedMultiplier = 1;
const speedSlider = document.getElementById('speed-slider');
const speedLabel  = document.getElementById('speed-label');
speedSlider.addEventListener('input', () => {
  speedMultiplier = parseFloat(speedSlider.value);
  speedLabel.textContent = `${speedMultiplier.toFixed(1)}x`;
});

// ── 信息面板 ────────────────────────────────────────────
const infoPanel = document.getElementById('info-panel');
document.getElementById('close-btn').addEventListener('click', () => infoPanel.classList.add('hidden'));

const labelMap = {
  type: '类型', diameter: '直径', mass: '质量',
  orbitalPeriod: '公转周期', dayLength: '自转周期',
  surfaceTemp: '表面温度', moons: '卫星数',
  coreTemp: '核心温度', age: '年龄',
};

function showInfo(data) {
  const d = data.details;
  const rows = Object.entries(d)
    .filter(([k]) => k !== 'description')
    .map(([k, v]) => `<tr><td class="label">${labelMap[k] || k}</td><td>${v}</td></tr>`)
    .join('');
  document.getElementById('planet-name').textContent = data.name;
  document.getElementById('planet-table').innerHTML = rows;
  document.getElementById('planet-desc').textContent = d.description;
  infoPanel.classList.remove('hidden');
}

// ── 左侧行星总览列表 ────────────────────────────────────
const listContainer = document.getElementById('planet-list-items');

function addListItem(data, mesh) {
  const item = document.createElement('div');
  item.className = 'list-item';
  const hex = data.color ? '#' + data.color.toString(16).padStart(6, '0') : '#aaaaaa';
  item.innerHTML = `<span class="dot" style="background:${hex}"></span><span>${data.name}</span>`;
  item.addEventListener('click', () => { showInfo(data); zoomTo(mesh); });
  listContainer.appendChild(item);
  return item;
}

// 太阳
const sunItem = document.createElement('div');
sunItem.className = 'list-item';
sunItem.innerHTML = `<span class="dot" style="background:#FFD060;box-shadow:0 0 6px #FF6600"></span><span>太阳</span>`;
sunItem.addEventListener('click', () => { showInfo(SUN); zoomTo(sunMesh); });
listContainer.appendChild(sunItem);

// 行星
PLANETS.forEach((p, i) => addListItem(p, planetObjects[i].mesh));

// 月球
const moonItem = document.createElement('div');
moonItem.className = 'list-item';
moonItem.innerHTML = `<span class="dot" style="background:#AAAAAA"></span><span>月球</span>`;
moonItem.addEventListener('click', () => { showInfo(MOON_DATA); zoomTo(moonMesh); });
listContainer.appendChild(moonItem);

// ── 3D 名称标签 ─────────────────────────────────────────
const labelsDiv = document.getElementById('labels');
const labelEls  = [];

function makeLabel(name) {
  const el = document.createElement('div');
  el.className = 'planet-label';
  el.textContent = name;
  labelsDiv.appendChild(el);
  return el;
}

labelEls.push({ el: makeLabel('太阳'),  mesh: sunMesh });
planetObjects.forEach(({ mesh, data }) => labelEls.push({ el: makeLabel(data.name), mesh }));
labelEls.push({ el: makeLabel('月球'), mesh: moonMesh });

// ── 镜头缩放动画 ────────────────────────────────────────
const INIT_CAM_POS  = new THREE.Vector3(0, 80, 200);
const INIT_CAM_LOOK = new THREE.Vector3(0, 0, 0);

let followMesh = null;   // 当前跟随的星球
let isZooming  = false;  // 正在推进中

function zoomTo(mesh) {
  followMesh = mesh;
  isZooming  = true;
}

// 重置视角
document.getElementById('reset-btn').addEventListener('click', () => {
  followMesh = null;
  isZooming  = false;
  // 平滑回到初始视角
  followMesh = { _reset: true };
  isZooming  = true;
});

// 用户手动操作时停止跟随
controls.addEventListener('start', () => {
  followMesh = null;
  isZooming  = false;
});

// ── 点击检测（区分拖拽） ─────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();
let   pointerDownPos = { x: 0, y: 0 };

canvas.addEventListener('pointerdown', (e) => {
  pointerDownPos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('pointerup', (e) => {
  const dx = e.clientX - pointerDownPos.x;
  const dy = e.clientY - pointerDownPos.y;
  if (dx * dx + dy * dy > 25) return; // 拖拽超过 5px 不算点击

  mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const meshes = [sunMesh, ...planetObjects.map(p => p.mesh), moonMesh];
  const hits   = raycaster.intersectObjects(meshes, false);

  if (hits.length > 0) {
    const mesh = hits[0].object;
    showInfo(mesh.userData.data);
    zoomTo(mesh);
  }
});

// ── 动画循环 ────────────────────────────────────────────
const clock   = new THREE.Clock();
const _wp     = new THREE.Vector3();
const _proj   = new THREE.Vector3();

function updateLabels() {
  labelEls.forEach(({ el, mesh }) => {
    mesh.getWorldPosition(_wp);
    _proj.copy(_wp).project(camera);
    if (_proj.z > 1) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.style.left = ((_proj.x * 0.5 + 0.5) * window.innerWidth)  + 'px';
    el.style.top  = ((-_proj.y * 0.5 + 0.5) * window.innerHeight - 28) + 'px';
  });
}

function updateCamera() {
  if (!followMesh) return;

  // 重置到初始视角
  if (followMesh._reset) {
    camera.position.lerp(INIT_CAM_POS,  0.04);
    controls.target.lerp(INIT_CAM_LOOK, 0.04);
    if (camera.position.distanceTo(INIT_CAM_POS) < 1) followMesh = null;
    return;
  }

  followMesh.getWorldPosition(_wp);
  const size = followMesh.userData.data?.size ?? 2;
  const dist = size * 5 + 8;
  const targetCamPos = _wp.clone().add(new THREE.Vector3(dist * 0.7, dist * 0.5, dist * 0.7));

  camera.position.lerp(targetCamPos, 0.04);
  controls.target.lerp(_wp,          0.05);

  if (isZooming && camera.position.distanceTo(targetCamPos) < 1.5) {
    isZooming = false; // 推进完成，保持跟随模式
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // 行星公转 + 自转
  planetObjects.forEach(({ mesh, pivot, data }) => {
    pivot.rotation.y += data.speed * 0.001 * speedMultiplier;
    mesh.rotation.y  += data.rotationSpeed * delta * speedMultiplier;
  });

  // 月球跟随地球
  earthMesh.getWorldPosition(_wp);
  moonGroup.position.copy(_wp);
  moonPivot.rotation.y += MOON_DATA.speed * 0.001 * speedMultiplier;
  moonMesh.rotation.y  += MOON_DATA.rotationSpeed * delta * speedMultiplier;

  updateCamera();
  updateLabels();
  controls.update();
  renderer.render(scene, camera);
}

animate();
