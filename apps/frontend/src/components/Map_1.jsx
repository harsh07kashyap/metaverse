// MapScene.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const MapScene = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    const scene = new THREE.Scene();
    const groundColor = 0xa8d5a2;
    scene.background = new THREE.Color(groundColor);

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
      -aspect * 300, aspect * 300,
      300, -300,
      0.1, 1000
    );
    camera.position.set(300,300,300);       // top-down view
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, -1);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor(groundColor);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(100, 200, 100);
    scene.add(dirLight);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(800, 600),
      new THREE.MeshStandardMaterial({ color: groundColor })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const loader = new GLTFLoader();
    const solidObjects = []; // For collision detection
    const placements = [
      ['stump', 0, 0],
      ['stump', 100, 0],
      ['stump', 200, 0],
      ['stump', 300, 0],
      ['stump', 400, 0],
      ['stump', 500, 0],
      ['tree',-100, -100],
      ['smallPlant',150,150],
      ['grass', -150,26],
    ];

    // Player
    let player = null;
    loader.load('/glb_models/player.glb', (gltf) => {
      player = gltf.scene;
      player.scale.set(20, 20, 20);
      player.position.set(-200, 0, 0);
      scene.add(player);
    });

    // Stumps
    placements.forEach(([type, x, z]) => {
      loader.load(`/glb_models/${type}.glb`, (gltf) => {
        const model = gltf.scene;
        model.scale.set(8, 8, 8);
        model.position.set(x, 0, z);
        model.castShadow = true;
        scene.add(model);
        if(type==='tree'){
          model.scale.set(200,100,100);
          model.position.set(0,200,0);
        }
        if(type==='smallPlant'){
          model.scale.set(45,45,45);
          model.position.set(150,0,150);
        }
        // if(type==='grass'){
        //   model.scale.set(500,500,100);
        //   // model.position.set(-430,0,100);
        // }

        const box = new THREE.Box3().setFromObject(model);
        solidObjects.push(box);
      });
    });

    // Movement
    const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
    const speed = 2;
    const movePlayer = (dx, dz) => {
      const newPosition = player.position.clone().add(new THREE.Vector3(dx, 0, dz));
      
      const playerBox = new THREE.Box3().setFromCenterAndSize(
        newPosition,
        new THREE.Vector3(20, 50, 20) // Adjust based on model scale
      );

      // Check collision
      const collision = solidObjects.some((box) => box.intersectsBox(playerBox));
      if (!collision) {
        player.position.copy(newPosition);
      }
    };

    const onKeyDown = (e) => { if (e.key in keys) keys[e.key] = true; };
    const onKeyUp =   (e) => { if (e.key in keys) keys[e.key] = false; };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const animate = () => {
      requestAnimationFrame(animate);
      if (player) {
        if (keys['w'] || keys['ArrowUp']) movePlayer(0, -speed);
        if (keys['s'] || keys['ArrowDown']) movePlayer(0, speed);
        if (keys['a'] || keys['ArrowLeft']) movePlayer(-speed, 0);
        if (keys['d'] || keys['ArrowRight']) movePlayer(speed, 0);
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize handling
    const onResize = () => {
      const a = window.innerWidth / window.innerHeight;
      camera.left = -a * 300;
      camera.right = a * 300;
      camera.top = 300;
      camera.bottom = -300;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100vw', height: '100vh', display: 'block' }}
    />
  );
};

export default MapScene;
