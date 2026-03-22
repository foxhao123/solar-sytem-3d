import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SUN, PLANETS } from './planets.js';
import {
  sunTexture, mercuryTexture, venusTexture, earthTexture,
  marsTexture, jupiterTexture, saturnTexture, uranusTexture,
  neptuneTexture, moonTexture,
} from './textures.js';

// 月球数据
export const MOON_DATA = {
  name: '月球',
  size: 0.54,
  distance: 6,
  speed: 13.37,
  rotationSpeed: 0.027,
  details: {
    type: '天然卫星（地球）',
    diameter: '3,474 km',
    mass: '7.34 × 10²² kg',
    orbitalPeriod: '27.3 天',
    dayLength: '27.3 地球日（潮汐锁定）',
    surfaceTemp: '-173°C ~ 127°C',
    moons: '无',
    description: '月球是地球唯一的天然卫星，也是太阳系第五大卫星。因潮汐锁定，始终以同一面朝向地球，对地球潮汐和自转轴稳定性有重要影响。',
  },
};

// 行星名 → 贴图函数
const TEXTURE_FN = {
  '水星': mercuryTexture,
  '金星': venusTexture,
  '地球': earthTexture,
  '火星': marsTexture,
  '木星': jupiterTexture,
  '土星': saturnTexture,
  '天王星': uranusTexture,
  '海王星': neptuneTexture,
};

export function createScene(canvas) {
  // ── 基础场景 ────────────────────────────────────────
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.set(0, 80, 200);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 1200;

  // ── 星空 ────────────────────────────────────────────
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(8000 * 3);
  for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 2400;
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })));

  // ── 光照 ────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x404060, 1.2));
  const sunLight = new THREE.PointLight(0xffffff, 4, 800);
  scene.add(sunLight);

  // ── 太阳 ────────────────────────────────────────────
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(SUN.size, 48, 48),
    new THREE.MeshStandardMaterial({
      map: sunTexture(),
      emissive: new THREE.Color(SUN.emissive),
      emissiveIntensity: 1.2,
      roughness: 0.8,
    })
  );
  sunMesh.userData = { type: 'sun', data: SUN };
  scene.add(sunMesh);

  // 太阳光晕
  const glowMesh = new THREE.Mesh(
    new THREE.SphereGeometry(SUN.size * 1.18, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xFF8800, transparent: true, opacity: 0.12, side: THREE.BackSide })
  );
  scene.add(glowMesh);

  // ── 行星 ────────────────────────────────────────────
  const planetObjects = [];
  let earthMesh = null;

  PLANETS.forEach((planetData) => {
    const incRad = (planetData.inclination || 0) * (Math.PI / 180);

    // 轨道线
    const pts = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * planetData.distance, 0, Math.sin(a) * planetData.distance));
    }
    const orbitLine = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x7788BB, transparent: true, opacity: 0.75 })
    );
    orbitLine.rotation.x = incRad;
    scene.add(orbitLine);

    // 行星贴图
    const texFn = TEXTURE_FN[planetData.name];
    const mat = new THREE.MeshStandardMaterial({
      map: texFn ? texFn() : null,
      color: texFn ? 0xffffff : planetData.color,
      emissive: new THREE.Color(planetData.emissive || 0x000000),
      emissiveIntensity: 0.12,
      roughness: 0.78,
      metalness: 0.04,
    });

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(planetData.size, 48, 48), mat);
    mesh.userData = { type: 'planet', data: planetData };

    // 土星环
    if (planetData.hasRings) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xC8A96E, side: THREE.DoubleSide, transparent: true, opacity: 0.82,
      });
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(planetData.size * 1.4, planetData.size * 2.4, 80),
        ringMat
      );
      ring.rotation.x = Math.PI / 3;
      mesh.add(ring);
    }

    // Pivot 控制公转（含倾角）
    const pivot = new THREE.Object3D();
    pivot.rotation.x = incRad;
    pivot.rotation.y = Math.random() * Math.PI * 2;
    scene.add(pivot);
    pivot.add(mesh);
    mesh.position.x = planetData.distance;

    if (planetData.name === '地球') earthMesh = mesh;
    planetObjects.push({ mesh, pivot, data: planetData });
  });

  // ── 月球（跟随地球） ─────────────────────────────────
  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(MOON_DATA.size, 32, 32),
    new THREE.MeshStandardMaterial({
      map: moonTexture(),
      emissive: new THREE.Color(0x111111),
      emissiveIntensity: 0.08,
      roughness: 0.92,
    })
  );
  moonMesh.userData = { type: 'moon', data: MOON_DATA };

  // moonGroup 根节点，每帧跟随地球世界坐标
  const moonGroup = new THREE.Object3D();
  scene.add(moonGroup);
  const moonPivot = new THREE.Object3D();
  moonPivot.rotation.x = 5.1 * (Math.PI / 180); // 月球轨道倾角
  moonGroup.add(moonPivot);
  moonPivot.add(moonMesh);
  moonMesh.position.x = MOON_DATA.distance;

  // ── 窗口缩放 ────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls, planetObjects, sunMesh, earthMesh, moonGroup, moonPivot, moonMesh };
}
