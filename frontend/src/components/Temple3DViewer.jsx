import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioService } from '../utils/audioService';
import { 
  Sun, Moon, Sunset, Compass, Sparkles, Bell, Flame, 
  Eye, RefreshCw, Layers, ShieldCheck, MapPin, Users,
  ChevronRight, Volume2, VolumeX, Maximize2, Minimize2
} from 'lucide-react';

const HOTSPOTS = [
  { id: 'sanctum', name: 'Garbhagriha (Sanctum Sanctorum)', pos: [0, 1.5, 0], wait: '12 mins', status: 'Optimal', desc: 'Inner sanctum housing the divine idol with continuous Vedic chanting.' },
  { id: 'gate1', name: 'Gate 1 (East Entry & Metal Detectors)', pos: [0, 0.5, 9.5], wait: '4 mins', status: 'Smooth', desc: 'Primary pilgrim ingress point with dual automated barcode turnstiles.' },
  { id: 'vip', name: 'Special Darshan / VIP Corridor', pos: [-5.5, 0.5, 2], wait: '2 mins', status: 'Priority', desc: 'Fast-track holding lounge for senior citizens and pre-booked VIP passes.' },
  { id: 'prasad', name: 'Maha Prasad Counter & Hall', pos: [5.5, 0.5, -2], wait: '3 mins', status: 'Active', desc: 'Automated distribution of consecrated Modak prasad packets.' },
  { id: 'queue', name: 'Sabha Mandap Queue Zig-Zag', pos: [0, 0.5, 4.5], wait: '9 mins', status: 'Regulated', desc: 'Covered queue holding maze with cooling mist fans and live wait-time displays.' },
  { id: 'cctv', name: 'Live AI Multi-Camera Surveillance Mast', pos: [7.5, 4.5, 7.5], wait: '60 FPS 4K', status: 'Active 360° AI Scan', desc: 'Motorized robotic PTZ dome with internal dual optics + dual long-range AI bullet cameras & volumetric vision scan cone.' }
];

export default function Temple3DViewer({ 
  height = '520px', 
  onSelectZone, 
  realtimeDensity = 68,
  compact = false 
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Dynamic 3D state refs
  const pilgrimsGroupRef = useRef(null);
  const diyasGroupRef = useRef(null);
  const flowersGroupRef = useRef(null);
  const bellMeshRef = useRef(null);
  const flagMeshRef = useRef(null);
  const sunLightRef = useRef(null);
  const ambientLightRef = useRef(null);
  const sanctumLightRef = useRef(null);
  const starsParticlesRef = useRef(null);
  const interactiveObjectsRef = useRef([]);

  // Live Camera 3D Refs
  const cctvHeadRef = useRef(null);
  const cctvRadarRef = useRef(null);
  const cctvRecLightRef = useRef(null);
  const gateCamLaserRef = useRef(null);

  // UI state
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day', 'sunset', 'night'
  const [activePreset, setActivePreset] = useState('overview');
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [pilgrimSpeed, setPilgrimSpeed] = useState(1);
  const [crowdFlowCount, setCrowdFlowCount] = useState(24);
  const [offeringCount, setOfferingCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading3D, setLoading3D] = useState(true);

  // Initialize Three.js Scene
  useEffect(() => {
    let isMounted = true;
    const container = mountRef.current;
    if (!container) return;

    // Check if THREE is loaded
    const THREE = window.THREE;
    if (!THREE) {
      console.error('Three.js library is not available on window.THREE');
      setLoading3D(false);
      return;
    }

    const width = container.clientWidth || 800;
    const heightVal = parseInt(height, 10) || 520;

    // 1. SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf0fdf4);
    scene.fog = new THREE.FogExp2(0xf0fdf4, 0.015);

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / heightVal, 0.1, 150);
    camera.position.set(16, 14, 22);
    cameraRef.current = camera;

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, heightVal);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. CONTROLS
    let controls = null;
    if (window.THREE.OrbitControls) {
      controls = new window.THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2.05; // don't go under floor
      controls.minDistance = 5;
      controls.maxDistance = 50;
      controls.target.set(0, 2, 0);
      controlsRef.current = controls;
    }

    // 5. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.85);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xfffaf0, 1.4);
    sunLight.position.set(20, 30, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 65;
    const d = 20;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Golden Sanctum divine point light
    const sanctumLight = new THREE.PointLight(0xf59e0b, 2.5, 12);
    sanctumLight.position.set(0, 2.8, 0);
    scene.add(sanctumLight);
    sanctumLightRef.current = sanctumLight;

    // 6. ENVIRONMENT & GROUND
    buildTempleComplex(THREE, scene);

    // 7. PILGRIMS QUEUE SIMULATION
    const pilgrimsGroup = new THREE.Group();
    scene.add(pilgrimsGroup);
    pilgrimsGroupRef.current = pilgrimsGroup;
    initPilgrims(THREE, pilgrimsGroup);

    // 8. OFFERINGS & PARTICLES GROUPS
    const diyasGroup = new THREE.Group();
    scene.add(diyasGroup);
    diyasGroupRef.current = diyasGroup;

    const flowersGroup = new THREE.Group();
    scene.add(flowersGroup);
    flowersGroupRef.current = flowersGroup;

    // Stars particle system for night mode
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 80;
      starPos[i + 1] = 15 + Math.random() * 35;
      starPos[i + 2] = (Math.random() - 0.5) * 80;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0 });
    const starsMesh = new THREE.Points(starsGeo, starsMat);
    scene.add(starsMesh);
    starsParticlesRef.current = starsMesh;

    // Raycaster for clicking hotspots & 3D buildings
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData?.hotspotId && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.hotspotId) {
          const spot = HOTSPOTS.find(h => h.id === obj.userData.hotspotId);
          if (spot) {
            setSelectedHotspot(spot);
            audioService.playTempleBell(1.2);
            if (onSelectZone) onSelectZone(spot);
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handleClick);

    // Animation Loop
    let clock = new THREE.Clock();
    let bellSwingAngle = 0;
    let bellSwingSpeed = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (controls) controls.update();

      // Flag fluttering
      if (flagMeshRef.current) {
        flagMeshRef.current.rotation.y = Math.sin(elapsed * 4) * 0.18;
        flagMeshRef.current.rotation.z = Math.cos(elapsed * 3) * 0.08;
      }

      // Bell swing animation
      if (bellMeshRef.current && bellMeshRef.current.userData.swinging) {
        bellMeshRef.current.userData.swingTime += delta * 6;
        const decay = Math.exp(-bellMeshRef.current.userData.swingTime * 0.5);
        bellMeshRef.current.rotation.z = Math.sin(bellMeshRef.current.userData.swingTime * 4) * 0.45 * decay;
        if (decay < 0.01) {
          bellMeshRef.current.userData.swinging = false;
          bellMeshRef.current.rotation.z = 0;
        }
      }

      // Sanctum Light divine pulsation
      if (sanctumLightRef.current) {
        sanctumLightRef.current.intensity = 2.4 + Math.sin(elapsed * 5) * 0.45 + Math.sin(elapsed * 12) * 0.15;
      }

      // Live AI CCTV Camera Panning & Scanning Animations
      if (cctvHeadRef.current) {
        cctvHeadRef.current.rotation.y = Math.sin(elapsed * 0.7) * 0.5;
      }
      if (cctvRadarRef.current) {
        cctvRadarRef.current.rotation.z = elapsed * 1.8;
      }
      if (cctvRecLightRef.current) {
        cctvRecLightRef.current.intensity = Math.sin(elapsed * 5) > 0 ? 2.0 : 0.2;
      }
      if (gateCamLaserRef.current) {
        gateCamLaserRef.current.position.z = 10.5 + Math.sin(elapsed * 2.5) * 0.55;
      }

      // Animate Pilgrims walking along queue paths
      if (pilgrimsGroupRef.current) {
        pilgrimsGroupRef.current.children.forEach(p => {
          if (p.userData && p.userData.progress !== undefined) {
            p.userData.progress += delta * 0.055 * pilgrimSpeed;
            if (p.userData.progress > 1) p.userData.progress = 0;

            const pos = getQueueCurvePoint(p.userData.progress, p.userData.pathOffset || 0);
            p.position.set(pos.x, pos.y + Math.abs(Math.sin(elapsed * 8 + p.userData.id)) * 0.08, pos.z);

            // Rotate towards direction of motion
            const nextPos = getQueueCurvePoint(p.userData.progress + 0.01, p.userData.pathOffset || 0);
            p.lookAt(nextPos.x, pos.y, nextPos.z);
          }
        });
      }

      // Animate Floating Offering Diyas
      if (diyasGroupRef.current) {
        for (let i = diyasGroupRef.current.children.length - 1; i >= 0; i--) {
          const diya = diyasGroupRef.current.children[i];
          diya.userData.age += delta;
          diya.position.y += delta * 0.45;
          diya.position.x += Math.sin(diya.userData.age * 2) * 0.015;
          diya.position.z += Math.cos(diya.userData.age * 2) * 0.015;
          diya.rotation.y += delta * 1.5;

          // Fade out as it floats up
          if (diya.userData.age > 8) {
            diyasGroupRef.current.remove(diya);
          }
        }
      }

      // Animate Falling Flowers (Pushpa Vrishti)
      if (flowersGroupRef.current) {
        for (let i = flowersGroupRef.current.children.length - 1; i >= 0; i--) {
          const flower = flowersGroupRef.current.children[i];
          flower.position.y -= delta * 1.2;
          flower.rotation.x += delta * 2;
          flower.rotation.y += delta * 3;
          if (flower.position.y < 0.2) {
            flowersGroupRef.current.remove(flower);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();
    setLoading3D(false);

    // Handle Resizing
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || parseInt(height, 10);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointerdown', handleClick);
      }
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      if (container) container.innerHTML = '';
    };
  }, [height]);

  // Build Temple 3D Architecture
  function buildTempleComplex(THREE, scene) {
    interactiveObjectsRef.current = [];

    // Materials
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xfdfaf7, roughness: 0.35, metalness: 0.1 });
    const stoneGroundMat = new THREE.MeshStandardMaterial({ color: 0xeadcc9, roughness: 0.8, metalness: 0.05 });
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.9 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.85, emissive: 0x78350f, emissiveIntensity: 0.2 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });
    const terracottaMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 });
    const metalBarrierMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.7 });
    const glassRoofMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, roughness: 0.1 });

    // 1. Courtyard Base & Grounds
    const baseGeo = new THREE.BoxGeometry(38, 0.5, 38);
    const baseMesh = new THREE.Mesh(baseGeo, stoneGroundMat);
    baseMesh.position.y = -0.25;
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Outer garden ring
    const gardenGeo = new THREE.RingGeometry(18, 24, 32);
    const gardenMesh = new THREE.Mesh(gardenGeo, grassMat);
    gardenMesh.rotation.x = -Math.PI / 2;
    gardenMesh.position.y = -0.2;
    gardenMesh.receiveShadow = true;
    scene.add(gardenMesh);

    // Decorative Water Fountain Pond
    const pondGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.4, 24);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.85 });
    const pondMesh = new THREE.Mesh(pondGeo, waterMat);
    pondMesh.position.set(-11, 0.1, 10);
    scene.add(pondMesh);

    // 2. Temple Plinth (Jagati)
    const plinthGeo = new THREE.BoxGeometry(16, 0.8, 18);
    const plinthMesh = new THREE.Mesh(plinthGeo, marbleMat);
    plinthMesh.position.set(0, 0.4, 0);
    plinthMesh.receiveShadow = true;
    plinthMesh.castShadow = true;
    scene.add(plinthMesh);

    // Plinth Carved Steps
    for (let s = 0; s < 4; s++) {
      const stepGeo = new THREE.BoxGeometry(7 - s * 0.4, 0.2, 0.6);
      const stepMesh = new THREE.Mesh(stepGeo, marbleMat);
      stepMesh.position.set(0, 0.1 + s * 0.2, 9.3 + s * 0.5);
      stepMesh.receiveShadow = true;
      scene.add(stepMesh);
    }

    // 3. MAIN SHIKHARA TOWER & GARBHAGRIHA (Sanctum)
    const sanctumGroup = new THREE.Group();
    sanctumGroup.userData = { hotspotId: 'sanctum' };

    // Sanctum Outer Walls
    const sanctumWallGeo = new THREE.BoxGeometry(8, 5, 8);
    const sanctumWallMesh = new THREE.Mesh(sanctumWallGeo, terracottaMat);
    sanctumWallMesh.position.set(0, 3.3, -2);
    sanctumWallMesh.castShadow = true;
    sanctumWallMesh.receiveShadow = true;
    sanctumGroup.add(sanctumWallMesh);

    // Multi-tiered Shikhara Spire (Gold-plated pyramid tiers)
    for (let t = 0; t < 5; t++) {
      const tierSize = 7.2 - t * 1.25;
      const tierHeight = 1.1;
      const tierGeo = new THREE.BoxGeometry(tierSize, tierHeight, tierSize);
      const tierMesh = new THREE.Mesh(tierGeo, goldMat);
      tierMesh.position.set(0, 6.3 + t * 1.05, -2);
      tierMesh.castShadow = true;
      sanctumGroup.add(tierMesh);
    }

    // Top Kalash Spire & Sacred Temple Flag (Dhwaja)
    const kalashGeo = new THREE.ConeGeometry(1.2, 2.5, 16);
    const kalashMesh = new THREE.Mesh(kalashGeo, goldMat);
    kalashMesh.position.set(0, 12.5, -2);
    kalashMesh.castShadow = true;
    sanctumGroup.add(kalashMesh);

    // Flag pole & silk flag
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8);
    const poleMesh = new THREE.Mesh(poleGeo, brassMat);
    poleMesh.position.set(0, 13.8, -2);
    sanctumGroup.add(poleMesh);

    const flagGeo = new THREE.PlaneGeometry(1.4, 0.8);
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, side: THREE.DoubleSide });
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.position.set(0.7, 14.5, -2);
    sanctumGroup.add(flagMesh);
    flagMeshRef.current = flagMesh;

    // Deity Altar & Golden Idol pedestal inside Sanctum
    const idolPedestalGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.8, 16);
    const idolPedestalMesh = new THREE.Mesh(idolPedestalGeo, goldMat);
    idolPedestalMesh.position.set(0, 1.2, -2);
    sanctumGroup.add(idolPedestalMesh);

    // Glowing Ganesha Divine Murti Silhouette
    const murtiGeo = new THREE.SphereGeometry(0.75, 16, 16);
    const murtiMat = new THREE.MeshStandardMaterial({ 
      color: 0xf59e0b, 
      emissive: 0xd97706, 
      emissiveIntensity: 0.6,
      roughness: 0.1 
    });
    const murtiMesh = new THREE.Mesh(murtiGeo, murtiMat);
    murtiMesh.position.set(0, 2.2, -2);
    sanctumGroup.add(murtiMesh);

    // Golden Aura Ring (Prabhavali)
    const auraGeo = new THREE.TorusGeometry(1.3, 0.12, 16, 32);
    const auraMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.8 });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.position.set(0, 2.4, -2.1);
    sanctumGroup.add(auraMesh);

    scene.add(sanctumGroup);
    interactiveObjectsRef.current.push(sanctumGroup);

    // 4. SABHA MANDAP & PILLARED HALL (Queue Area)
    const mandapGroup = new THREE.Group();
    mandapGroup.userData = { hotspotId: 'queue' };

    // Columns / Pillars (12 Carved Pillars)
    const pillarPositions = [
      [-5, 5], [-5, 2], [-5, -1],
      [5, 5], [5, 2], [5, -1],
      [-2.5, 6], [2.5, 6],
      [-2.5, 3], [2.5, 3],
      [-2.5, 0], [2.5, 0]
    ];

    pillarPositions.forEach(([px, pz]) => {
      const pillarGeo = new THREE.CylinderGeometry(0.35, 0.42, 4.2, 12);
      const pillarMesh = new THREE.Mesh(pillarGeo, marbleMat);
      pillarMesh.position.set(px, 2.9, pz);
      pillarMesh.castShadow = true;
      pillarMesh.receiveShadow = true;
      mandapGroup.add(pillarMesh);

      // Pillar capital decorative block
      const capGeo = new THREE.BoxGeometry(0.9, 0.3, 0.9);
      const capMesh = new THREE.Mesh(capGeo, marbleMat);
      capMesh.position.set(px, 5.0, pz);
      mandapGroup.add(capMesh);
    });

    // Mandap Roof (Translucent Glass & Stone Cornices)
    const mandapRoofGeo = new THREE.BoxGeometry(13.5, 0.4, 9.5);
    const mandapRoofMesh = new THREE.Mesh(mandapRoofGeo, glassRoofMat);
    mandapRoofMesh.position.set(0, 5.2, 2.5);
    mandapGroup.add(mandapRoofMesh);

    // Queue Steel Barricades (Zig-zag lanes)
    const laneZ = [1.5, 3.2, 4.8, 6.4];
    laneZ.forEach((lz, idx) => {
      const railGeo = new THREE.BoxGeometry(idx % 2 === 0 ? 8 : 7.5, 0.8, 0.08);
      const railMesh = new THREE.Mesh(railGeo, metalBarrierMat);
      railMesh.position.set(idx % 2 === 0 ? -0.8 : 0.8, 1.2, lz);
      railMesh.castShadow = true;
      mandapGroup.add(railMesh);
    });

    // Brass Temple Bell Hanging from Mandapam
    const bellHangerGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8);
    const bellHangerMesh = new THREE.Mesh(bellHangerGeo, brassMat);
    bellHangerMesh.position.set(0, 4.4, 6.8);
    mandapGroup.add(bellHangerMesh);

    const bellGeo = new THREE.ConeGeometry(0.5, 0.8, 16);
    const bellMesh = new THREE.Mesh(bellGeo, brassMat);
    bellMesh.position.set(0, 3.6, 6.8);
    bellMesh.rotation.x = Math.PI;
    bellMesh.castShadow = true;
    bellMesh.userData = { swinging: false, swingTime: 0 };
    mandapGroup.add(bellMesh);
    bellMeshRef.current = bellMesh;

    scene.add(mandapGroup);
    interactiveObjectsRef.current.push(mandapGroup);

    // 5. ENTRANCE ARCHWAY (GATE 1)
    const gateGroup = new THREE.Group();
    gateGroup.userData = { hotspotId: 'gate1' };

    const archPillar1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.5, 1.2), terracottaMat);
    archPillar1.position.set(-3.5, 2.75, 10.5);
    archPillar1.castShadow = true;
    gateGroup.add(archPillar1);

    const archPillar2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.5, 1.2), terracottaMat);
    archPillar2.position.set(3.5, 2.75, 10.5);
    archPillar2.castShadow = true;
    gateGroup.add(archPillar2);

    const archLintel = new THREE.Mesh(new THREE.BoxGeometry(9, 1.2, 1.5), goldMat);
    archLintel.position.set(0, 5.6, 10.5);
    archLintel.castShadow = true;
    gateGroup.add(archLintel);

    // Gate 1 Turnstile scanners
    for (let g = -1.8; g <= 1.8; g += 1.8) {
      const turnstile = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.8), metalBarrierMat);
      turnstile.position.set(g, 0.65, 10.5);
      gateGroup.add(turnstile);

      // Scanner green LED light
      const ledGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(g, 1.22, 10.5);
      gateGroup.add(ledMesh);
    }

    scene.add(gateGroup);
    interactiveObjectsRef.current.push(gateGroup);

    // 6. VIP FAST-TRACK CORRIDOR (West Side)
    const vipGroup = new THREE.Group();
    vipGroup.userData = { hotspotId: 'vip' };

    const vipCanopy = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 10), goldMat);
    vipCanopy.position.set(-6.5, 3.8, 2);
    vipGroup.add(vipCanopy);

    const vipRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 9), brassMat);
    vipRail.position.set(-5.2, 1.25, 2);
    vipGroup.add(vipRail);

    scene.add(vipGroup);
    interactiveObjectsRef.current.push(vipGroup);

    // 7. MAHA PRASAD COUNTER (East Side)
    const prasadGroup = new THREE.Group();
    prasadGroup.userData = { hotspotId: 'prasad' };

    const prasadHall = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 7), marbleMat);
    prasadHall.position.set(6.8, 2.4, -2);
    prasadHall.castShadow = true;
    prasadGroup.add(prasadHall);

    const prasadRoof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 1.8, 4), terracottaMat);
    prasadRoof.position.set(6.8, 4.8, -2);
    prasadRoof.rotation.y = Math.PI / 4;
    prasadGroup.add(prasadRoof);

    scene.add(prasadGroup);
    interactiveObjectsRef.current.push(prasadGroup);

    // 8. HIGH-PRECISION CENTRAL CCTV & AI VISION MAST
    const cctvGroup = new THREE.Group();
    cctvGroup.userData = { hotspotId: 'cctv' };

    // Camera materials
    const camSteelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.85 });
    const camWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.25 });
    const camDarkMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.9 });
    const camGlassLensMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.05, metalness: 0.95, transparent: true, opacity: 0.9 });
    const camDomeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.45, depthWrite: false });
    const camBeamMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false });
    const radarRingMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
    const recLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const okLedMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    // 8A. Concrete & Steel Anchor Foundation
    const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.25, 16), camSteelMat);
    basePlate.position.set(7.5, 0.12, 7.5);
    basePlate.receiveShadow = true;
    cctvGroup.add(basePlate);

    // 4 Foundation Anchor Hex Bolts
    for (let b = 0; b < 4; b++) {
      const angle = (b * Math.PI) / 2;
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 6), camSteelMat);
      bolt.position.set(7.5 + Math.cos(angle) * 0.55, 0.2, 7.5 + Math.sin(angle) * 0.55);
      cctvGroup.add(bolt);
    }

    // Weatherproof Ground Telemetry & AI Processing Cabinet
    const telemetryCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.95, 0.42), camSteelMat);
    telemetryCabinet.position.set(7.5, 0.72, 7.5 + 0.45);
    telemetryCabinet.castShadow = true;
    cctvGroup.add(telemetryCabinet);

    // Blinking telemetry power LED
    const telemetryLed = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), okLedMat);
    telemetryLed.position.set(7.5, 1.05, 7.5 + 0.67);
    cctvGroup.add(telemetryLed);

    // 8B. Telescopic Heavy Mast Pole
    const lowerMast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 2.8, 16), camSteelMat);
    lowerMast.position.set(7.5, 1.4, 7.5);
    lowerMast.castShadow = true;
    cctvGroup.add(lowerMast);

    const mastCollar = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 8, 16), camSteelMat);
    mastCollar.position.set(7.5, 2.8, 7.5);
    mastCollar.rotation.x = Math.PI / 2;
    cctvGroup.add(mastCollar);

    const upperMast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 3.8, 16), camSteelMat);
    upperMast.position.set(7.5, 4.7, 7.5);
    upperMast.castShadow = true;
    cctvGroup.add(upperMast);

    // Mast Top Equipment Mounting Platform
    const topPlatform = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 20), camSteelMat);
    topPlatform.position.set(7.5, 6.6, 7.5);
    cctvGroup.add(topPlatform);

    // Top Platform Safety Guard Rail
    const safetyRail = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.025, 8, 20), camSteelMat);
    safetyRail.position.set(7.5, 6.85, 7.5);
    safetyRail.rotation.x = Math.PI / 2;
    cctvGroup.add(safetyRail);

    // Lightning Rod & Radio Comms Antenna
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 1.4, 8), camSteelMat);
    antenna.position.set(7.5, 7.3, 7.5);
    cctvGroup.add(antenna);

    // Top Aircraft Warning Strobe Light
    const strobeLight = new THREE.PointLight(0xef4444, 1.5, 5);
    strobeLight.position.set(7.5, 7.95, 7.5);
    cctvGroup.add(strobeLight);

    // 8C. Dual Outrigger Arms (T-Bar for directional coverage)
    const outriggerBar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.14), camSteelMat);
    outriggerBar.position.set(7.5, 6.55, 7.5);
    cctvGroup.add(outriggerBar);

    // Outrigger Bullet Camera 1 (West: Queue Complex)
    const bullet1Group = new THREE.Group();
    bullet1Group.position.set(7.5 - 1.05, 6.4, 7.5);
    const bulletBody1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.42, 16), camWhiteMat);
    bulletBody1.rotation.z = Math.PI / 2;
    bulletBody1.rotation.y = -Math.PI / 4;
    bullet1Group.add(bulletBody1);
    const visor1 = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.28), camDarkMat);
    visor1.position.set(0, 0.14, 0);
    visor1.rotation.y = -Math.PI / 4;
    bullet1Group.add(visor1);
    const lens1 = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), camGlassLensMat);
    lens1.position.set(-0.21, 0, 0.05);
    lens1.rotation.y = -Math.PI / 2 - Math.PI / 4;
    bullet1Group.add(lens1);
    cctvGroup.add(bullet1Group);

    // Outrigger Bullet Camera 2 (South: Gate 1 Approach)
    const bullet2Group = new THREE.Group();
    bullet2Group.position.set(7.5 + 1.05, 6.4, 7.5);
    const bulletBody2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.42, 16), camWhiteMat);
    bulletBody2.rotation.z = -Math.PI / 2;
    bulletBody2.rotation.y = Math.PI / 4;
    bullet2Group.add(bulletBody2);
    const visor2 = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.28), camDarkMat);
    visor2.position.set(0, 0.14, 0);
    visor2.rotation.y = Math.PI / 4;
    bullet2Group.add(visor2);
    const lens2 = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), camGlassLensMat);
    lens2.position.set(0.21, 0, 0.05);
    lens2.rotation.y = Math.PI / 2 + Math.PI / 4;
    bullet2Group.add(lens2);
    cctvGroup.add(bullet2Group);

    // 8D. CENTRAL HIGH-SPEED 360° PTZ DOME CAMERA (ANIMATED PAN/TILT)
    const ptzHead = new THREE.Group();
    ptzHead.position.set(7.5, 6.45, 7.5);
    cctvHeadRef.current = ptzHead;

    const ptzMount = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.18, 20), camWhiteMat);
    ptzMount.position.y = 0.08;
    ptzHead.add(ptzMount);

    const ptzDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.75),
      camDomeMat
    );
    ptzDome.position.y = 0;
    ptzDome.rotation.x = Math.PI;
    ptzHead.add(ptzDome);

    const internalOptic = new THREE.Group();
    internalOptic.position.set(0, -0.15, 0);
    internalOptic.rotation.x = 0.55;
    const opticBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.26, 16), camDarkMat);
    internalOptic.add(opticBarrel);
    const opticLens = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), camGlassLensMat);
    opticLens.position.y = -0.135;
    opticLens.rotation.x = Math.PI / 2;
    internalOptic.add(opticLens);
    ptzHead.add(internalOptic);

    const recLed = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), recLedMat);
    recLed.position.set(0, 0.16, 0.26);
    ptzHead.add(recLed);

    const recPointLight = new THREE.PointLight(0xef4444, 1.8, 5);
    recPointLight.position.set(0, 0.16, 0.28);
    cctvRecLightRef.current = recPointLight;
    ptzHead.add(recPointLight);

    cctvGroup.add(ptzHead);

    // 8E. VOLUMETRIC HOLOGRAPHIC AI SCANNING VISION CONE
    const visionBeam = new THREE.Mesh(
      new THREE.ConeGeometry(4.4, 6.4, 24, 1, true),
      camBeamMat
    );
    visionBeam.position.set(7.5, 3.2, 7.5);
    visionBeam.rotation.x = Math.PI;
    cctvGroup.add(visionBeam);

    // 8F. GROUND HOLOGRAPHIC SCANNING RADAR RETICLE
    const groundRadarGroup = new THREE.Group();
    groundRadarGroup.position.set(7.5, 0.06, 7.5);
    groundRadarGroup.rotation.x = -Math.PI / 2;

    const outerRadarRing = new THREE.Mesh(new THREE.RingGeometry(4.1, 4.25, 32), radarRingMat);
    groundRadarGroup.add(outerRadarRing);

    const midRadarRing = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.22, 32), radarRingMat);
    groundRadarGroup.add(midRadarRing);

    const innerRadarRing = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.5, 16), radarRingMat);
    groundRadarGroup.add(innerRadarRing);

    const radarArm = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 0.06), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 }));
    radarArm.position.x = 2.05;
    const radarPivot = new THREE.Group();
    radarPivot.add(radarArm);
    cctvRadarRef.current = radarPivot;
    groundRadarGroup.add(radarPivot);

    cctvGroup.add(groundRadarGroup);

    // 8G. GATE 1 ENTRANCE OVERHEAD AI SCANNER (CAM-02)
    const gateCamGroup = new THREE.Group();
    gateCamGroup.position.set(0, 6.2, 10.5);
    const gateCamBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.45), camSteelMat);
    gateCamGroup.add(gateCamBody);
    const gateCamLens = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), camGlassLensMat);
    gateCamLens.position.set(0, -0.115, 0.05);
    gateCamLens.rotation.x = Math.PI / 2;
    gateCamGroup.add(gateCamLens);

    const laserBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    laserBeam.position.set(0, 0.08, 10.5);
    laserBeam.rotation.x = -Math.PI / 2;
    gateCamLaserRef.current = laserBeam;
    scene.add(laserBeam);

    cctvGroup.add(gateCamGroup);

    scene.add(cctvGroup);
    interactiveObjectsRef.current.push(cctvGroup);

    // 9. HOTSPOT FLOATING 3D MARKER PINS
    HOTSPOTS.forEach(spot => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(spot.pos[0], spot.pos[1] + 1.2, spot.pos[2]);

      const pinGeo = new THREE.ConeGeometry(0.35, 0.7, 16);
      const pinMat = new THREE.MeshStandardMaterial({ 
        color: spot.id === 'sanctum' ? 0xf59e0b : 0x0284c7, 
        emissive: spot.id === 'sanctum' ? 0xd97706 : 0x0369a1,
        emissiveIntensity: 0.6 
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.rotation.x = Math.PI; // point downwards
      pinGroup.add(pinMesh);

      const ringGeo = new THREE.RingGeometry(0.2, 0.4, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.45;
      ringMesh.rotation.x = -Math.PI / 2;
      pinGroup.add(ringMesh);

      pinGroup.userData = { hotspotId: spot.id };
      scene.add(pinGroup);
      interactiveObjectsRef.current.push(pinGroup);
    });
  }

  // Generate Queue Trajectory Curve
  function getQueueCurvePoint(t, offset = 0) {
    // Waypoints along entrance -> zig-zag -> sanctum -> exit
    const waypoints = [
      { x: 0, z: 12 },    // Gate 1 outer
      { x: 0, z: 9.5 },   // Gate 1 turnstile
      { x: 2.2, z: 6.4 }, // Queue row 1
      { x: -2.2, z: 4.8 },// Queue row 2
      { x: 2.2, z: 3.2 }, // Queue row 3
      { x: 0, z: 1.5 },   // Darshan entry gate
      { x: 0, z: -0.5 },  // Garbhagriha altar view
      { x: 3.5, z: -1.8 },// South pradakshina
      { x: 5.8, z: -1.5 },// Prasad distribution
      { x: 7.2, z: 8.5 }  // Temple exit
    ];

    const totalSegs = waypoints.length - 1;
    const seg = Math.min(Math.floor(t * totalSegs), totalSegs - 1);
    const subT = (t * totalSegs) - seg;

    const p0 = waypoints[seg];
    const p1 = waypoints[seg + 1];

    const x = p0.x + (p1.x - p0.x) * subT + (offset * 0.3);
    const z = p0.z + (p1.z - p0.z) * subT;
    return { x, y: 0.8, z };
  }

  // Create Animated 3D Pilgrims
  function initPilgrims(THREE, group) {
    group.clear();
    const pilgrimColors = [0xf97316, 0xe11d48, 0xfbbf24, 0xffffff, 0x9333ea, 0x0284c7];

    for (let i = 0; i < crowdFlowCount; i++) {
      const pilgrim = new THREE.Group();

      // Body (Saffron/White/Maroon traditional dhoti/kurta)
      const bodyGeo = new THREE.CylinderGeometry(0.2, 0.28, 0.9, 8);
      const color = pilgrimColors[i % pilgrimColors.length];
      const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.y = 0.45;
      bodyMesh.castShadow = true;
      pilgrim.add(bodyMesh);

      // Head
      const headGeo = new THREE.SphereGeometry(0.16, 8, 8);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.y = 1.0;
      pilgrim.add(headMesh);

      pilgrim.userData = {
        id: i,
        progress: (i / crowdFlowCount),
        pathOffset: (Math.random() - 0.5) * 0.8
      };

      const startPos = getQueueCurvePoint(pilgrim.userData.progress, pilgrim.userData.pathOffset);
      pilgrim.position.set(startPos.x, startPos.y, startPos.z);

      group.add(pilgrim);
    }
  }

  // Camera presets
  const setCameraPreset = (presetName) => {
    setActivePreset(presetName);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (presetName === 'overview') {
      camera.position.set(16, 14, 22);
      controls.target.set(0, 2, 0);
    } else if (presetName === 'camera') {
      camera.position.set(10.5, 8.8, 10.5);
      controls.target.set(1.5, 1.2, 4.0);
    } else if (presetName === 'sanctum') {
      camera.position.set(0, 3.8, 6.5);
      controls.target.set(0, 2.4, -2);
    } else if (presetName === 'queue') {
      camera.position.set(6, 6, 13);
      controls.target.set(0, 1.5, 4.5);
    } else if (presetName === 'topdown') {
      camera.position.set(0, 32, 2);
      controls.target.set(0, 0, 0);
    }
  };

  // Change Lighting Mode
  const handleTimeChange = (mode) => {
    setTimeOfDay(mode);
    const scene = sceneRef.current;
    const sunLight = sunLightRef.current;
    const ambientLight = ambientLightRef.current;
    const stars = starsParticlesRef.current;
    const sanctumLight = sanctumLightRef.current;
    if (!scene || !sunLight || !ambientLight) return;

    if (mode === 'day') {
      scene.background.set(0xf0fdf4);
      scene.fog.color.set(0xf0fdf4);
      sunLight.color.set(0xfffaf0);
      sunLight.intensity = 1.4;
      sunLight.position.set(20, 30, 15);
      ambientLight.color.set(0xffedd5);
      ambientLight.intensity = 0.85;
      if (stars) stars.material.opacity = 0;
      if (sanctumLight) sanctumLight.intensity = 2.5;
    } else if (mode === 'sunset') {
      scene.background.set(0xffedd5);
      scene.fog.color.set(0xffedd5);
      sunLight.color.set(0xf97316);
      sunLight.intensity = 1.6;
      sunLight.position.set(30, 10, 10);
      ambientLight.color.set(0xfef08a);
      ambientLight.intensity = 0.65;
      if (stars) stars.material.opacity = 0.3;
      if (sanctumLight) sanctumLight.intensity = 3.2;
    } else if (mode === 'night') {
      scene.background.set(0x090d16);
      scene.fog.color.set(0x090d16);
      sunLight.color.set(0x38bdf8);
      sunLight.intensity = 0.3;
      sunLight.position.set(-15, 20, -10);
      ambientLight.color.set(0x1e293b);
      ambientLight.intensity = 0.3;
      if (stars) stars.material.opacity = 0.9;
      if (sanctumLight) sanctumLight.intensity = 4.8;
    }
  };

  // Devotee Actions
  const handleRingBell = () => {
    if (bellMeshRef.current) {
      bellMeshRef.current.userData.swinging = true;
      bellMeshRef.current.userData.swingTime = 0;
    }
    audioService.playTempleBell(1.0);
    // Extra harmonic chime after 200ms
    setTimeout(() => audioService.playTempleBell(1.33), 200);
  };

  const handleOfferDiya = () => {
    const THREE = window.THREE;
    if (!THREE || !diyasGroupRef.current) return;

    audioService.playAartiChime();
    setOfferingCount(c => c + 1);

    // Create 3D Diya mesh
    const diya = new THREE.Group();
    const diyaClay = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.15, 0.15, 12),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 })
    );
    diya.add(diyaClay);

    // Diya Flame particle
    const flameMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    flameMesh.position.y = 0.15;
    diya.add(flameMesh);

    // Flame PointLight
    const diyaLight = new THREE.PointLight(0xf59e0b, 1.2, 4);
    diyaLight.position.y = 0.2;
    diya.add(diyaLight);

    diya.position.set((Math.random() - 0.5) * 4, 0.8, 4 + Math.random() * 2);
    diya.userData = { age: 0 };
    diyasGroupRef.current.add(diya);

    if (window.confetti) {
      window.confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handlePushpaVrishti = () => {
    const THREE = window.THREE;
    if (!THREE || !flowersGroupRef.current) return;

    audioService.playAartiChime();
    const colors = [0xf43f5e, 0xf59e0b, 0xfacc15, 0xffffff];

    for (let i = 0; i < 40; i++) {
      const petalGeo = new THREE.PlaneGeometry(0.2, 0.2);
      const petalMat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        side: THREE.DoubleSide
      });
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(
        (Math.random() - 0.5) * 6,
        6 + Math.random() * 4,
        -2 + (Math.random() - 0.5) * 6
      );
      petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      flowersGroupRef.current.add(petal);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height,
      borderRadius: compact ? '12px' : '20px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      boxShadow: '0 20px 35px -5px rgba(0,0,0,0.25), 0 0 0 1px rgba(245, 158, 11, 0.15)',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Top HUD Bar */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        {/* Living Badge */}
        <div style={{
          pointerEvents: 'auto',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '8px 16px',
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#ffffff',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
        }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#22c55e',
            display: 'inline-block',
            boxShadow: '0 0 10px #22c55e',
            animation: 'pulse 1.8s infinite'
          }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em', color: '#fef08a' }}>
              3D LIVING TEMPLE DIORAMA
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
              Real-Time Queue Simulation • {crowdFlowCount} Devotee Streams
            </div>
          </div>
        </div>

        {/* Time of Day & Audio Controls */}
        <div style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '6px 10px',
          borderRadius: '30px'
        }}>
          <button
            onClick={() => handleTimeChange('day')}
            title="Daytime Sun"
            style={{
              background: timeOfDay === 'day' ? '#f59e0b' : 'transparent',
              color: timeOfDay === 'day' ? '#0f172a' : '#cbd5e1',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <Sun size={14} /> Day
          </button>
          <button
            onClick={() => handleTimeChange('sunset')}
            title="Godhuli Sunset"
            style={{
              background: timeOfDay === 'sunset' ? '#ea580c' : 'transparent',
              color: timeOfDay === 'sunset' ? '#ffffff' : '#cbd5e1',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <Sunset size={14} /> Sunset
          </button>
          <button
            onClick={() => handleTimeChange('night')}
            title="Maha Aarti Night"
            style={{
              background: timeOfDay === 'night' ? '#38bdf8' : 'transparent',
              color: timeOfDay === 'night' ? '#0f172a' : '#cbd5e1',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <Moon size={14} /> Aarti Night
          </button>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

          <button
            onClick={() => {
              const muted = audioService.toggleMute();
              setIsMuted(muted);
            }}
            style={{
              background: 'transparent',
              color: isMuted ? '#f87171' : '#facc15',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex'
            }}
            title={isMuted ? 'Unmute Bell Chimes' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Bottom Interactive Ritual Actions Bar */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        pointerEvents: 'none',
        zIndex: 10,
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Camera Angles Selector */}
        <div style={{
          pointerEvents: 'auto',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '6px',
          borderRadius: '14px',
          display: 'flex',
          gap: '6px'
        }}>
          {[
            { id: 'overview', label: 'Panoramic' },
            { id: 'camera', label: '📹 Live AI Cam' },
            { id: 'sanctum', label: 'Garbhagriha' },
            { id: 'queue', label: 'Queue Line' },
            { id: 'topdown', label: '2D Map' }
          ].map(preset => (
            <button
              key={preset.id}
              onClick={() => setCameraPreset(preset.id)}
              style={{
                background: activePreset === preset.id ? '#b45309' : 'transparent',
                color: activePreset === preset.id ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Live AI CCTV Surveillance Overlay when in Camera Mode */}
        {(activePreset === 'camera' || selectedHotspot?.id === 'cctv') && (
          <div style={{
            position: 'absolute',
            top: '74px',
            left: '16px',
            background: 'rgba(9, 13, 22, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#f8fafc',
            zIndex: 15,
            pointerEvents: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            maxWidth: '320px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px #ef4444' }} />
                LIVE CCTV • CAM-06 (CENTRAL MAST)
              </div>
              <span style={{ fontSize: '0.65rem', background: '#0369a1', color: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                60 FPS 4K
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.45 }}>
              <div>FOV: <strong>360° Motorized PTZ + Dual Outrigger Bullets</strong></div>
              <div>AI Vision Pipeline: <strong style={{ color: '#4ade80' }}>ACTIVE (YOLO-v8n)</strong></div>
              <div>Ground Optical Beam: <strong style={{ color: '#38bdf8' }}>Holographic Frustum</strong></div>
              <div>Queue Density: <strong style={{ color: '#facc15' }}>{realtimeDensity}% Regulated</strong></div>
            </div>
          </div>
        )}

        {/* Live Devotee Interactive Offerings Buttons */}
        <div style={{
          pointerEvents: 'auto',
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={handleRingBell}
            style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#ffffff',
              border: '1px solid #f59e0b',
              padding: '10px 16px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(217, 119, 6, 0.4)',
              transition: 'transform 0.1s, box-shadow 0.1s'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Bell size={16} />
            <span>Ring Bell</span>
          </button>

          <button
            onClick={handleOfferDiya}
            style={{
              background: 'linear-gradient(135deg, #e11d48, #be123c)',
              color: '#ffffff',
              border: '1px solid #fb7185',
              padding: '10px 16px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(225, 29, 72, 0.4)'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Flame size={16} />
            <span>Offer Diya ({offeringCount})</span>
          </button>

          <button
            onClick={handlePushpaVrishti}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: '#ffffff',
              border: '1px solid #c4b5fd',
              padding: '10px 16px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Sparkles size={16} />
            <span>Flower Shower</span>
          </button>
        </div>
      </div>

      {/* Selected Hotspot Detailed Popup Card */}
      {selectedHotspot && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          maxWidth: '320px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '16px',
          padding: '16px',
          color: '#ffffff',
          zIndex: 20,
          boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fef08a' }}>
              {selectedHotspot.name}
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.1rem',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '12px', lineHeight: 1.4 }}>
            {selectedHotspot.desc}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: 'rgba(255,255,255,0.06)',
            padding: '8px 12px',
            borderRadius: '10px',
            marginBottom: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.675rem', color: '#94a3b8' }}>Est. Wait Time</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>{selectedHotspot.wait}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.675rem', color: '#94a3b8' }}>Lane Status</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4ade80' }}>{selectedHotspot.status}</div>
            </div>
          </div>
          <button
            onClick={() => {
              if (onSelectZone) onSelectZone(selectedHotspot);
              setSelectedHotspot(null);
            }}
            style={{
              width: '100%',
              background: '#b45309',
              color: '#ffffff',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>Focus Camera Here</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Instructions Pill */}
      <div style={{
        position: 'absolute',
        top: '75px',
        right: '16px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.7rem',
        color: '#94a3b8',
        pointerEvents: 'none'
      }}>
        🖱️ Drag to rotate • Scroll to zoom • Click buildings to inspect
      </div>
    </div>
  );
}
