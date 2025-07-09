import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { PMREMGenerator } from 'three/examples/jsm/utils/PMREMGenerator.js';
import { EffectComposer } from "three/examples/jsm/Addons.js";
import { RenderPass } from "three/examples/jsm/Addons.js";
import { ShaderPass } from "three/examples/jsm/Addons.js";
import { RGBShiftShader } from "three/examples/jsm/Addons.js";

const MapScene2 = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    //scene
    const scene = new THREE.Scene();

    //camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 40;

    //renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //for good performance without sacrificing quality
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; //for better lighting
    renderer.toneMappingExposure = 1.0; //for better lighting
    renderer.outputEncoding = THREE.sRGBEncoding;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.uniforms["amount"].value = 0.15; //amount of RGB shift
    composer.addPass(rgbShiftPass);

    //loader=
    const loader = new GLTFLoader();
    // const controls=new OrbitControls(camera,renderer.domElement);
    // controls.enableZoom = true;
    // controls.zoomSpeed = 1.5;
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.1;

    const placements = [
      ["stump", 0, 11],
      ["stump", 10, 11],
      ["stump", -10, 11],
      ["stump", 20, 11],
      ["stump", -20, 11],
      ["smallPlant", 30, 11],
      ["grass", -30, 11],
      ["bench", 0, 15],
      ["pineTrees", -30, 15],
    ];
    const solidObjects = []; // For collision detection
    // Movement
    const keys = {
      w: false,
      s: false, 
      a: false,
      d: false,
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    };
    const speed = 5;
    const onKeyDown = (e) => {
      if (e.key in keys) keys[e.key] = true;
      console.log(`Key pressed: ${e.key}`); // Debugging line
    };
    const onKeyUp = (e) => {
      if (e.key in keys) keys[e.key] = false;
      console.log(`Key released: ${e.key}`); // Debugging line
    };
    const startControlsAndAnimation=()=>{
    const movePlayer = (dx, dz) => {
      if (!player) return;
      console.log("move player is called")
      const newPosition = player.position
        .clone()
        .add(new THREE.Vector3(dx, 0, dz));
      const playerBox = new THREE.Box3().setFromCenterAndSize(
        newPosition,
        new THREE.Vector3(20, 50, 20)
      );

      const collision = solidObjects.some((box) =>
        box.intersectsBox(playerBox)
      );
      if (!collision) {
        player.position.copy(newPosition);
      }
    };
    

    // window.addEventListener('resize', onResize);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);
    // animate
    const animate = () => {
      requestAnimationFrame(animate);
      // controls.update();
      if (player) {
        if (keys["w"] || keys["ArrowUp"]){
          console.log("Moving up");
           movePlayer(0, -speed)};
        if (keys["s"] || keys["ArrowDown"]) movePlayer(0, speed);
        if (keys["a"] || keys["ArrowLeft"]) movePlayer(-speed, 0);
        if (keys["d"] || keys["ArrowRight"]) movePlayer(speed, 0);
      }
      renderer.render(scene, camera);
    };
    animate();
  }

    //load player
    let player = null;
    

    //model
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    let model;
    new RGBELoader().load(
      "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/poolbeg_1k.hdr",
      function (texture) {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        // scene.background=envMap;
        scene.environment = envMap;
        texture.dispose();
        pmremGenerator.dispose();

        loader.load(
          "/glb_models/floor.glb",
          (gltf) => {
            model = gltf.scene;
            model.scale.set(60, 300, 10);
            model.position.set(-8.5, 23, 0);
            scene.add(model);
            console.log("Model loaded successfully");
          },
          undefined,
          (error) => {
            console.error("An error happened", error);
          }
        );

        loader.load("/glb_models/player.glb", (gltf) => {
      player = gltf.scene;
      player.scale.set(3, 1, 1);
      player.position.set(-15, -10, 11);
      player.castShadow = true; // Enable shadow casting for the player
      player.rotateX(Math.PI / 4); // Rotate to face upwards
      scene.add(player);
    });
    startControlsAndAnimation();
      }
    );

    //load models
    placements.forEach(([type, x, z]) => {
      loader.load(`/glb_models/${type}.glb`, (gltf) => {
        const model = gltf.scene;
        model.castShadow = true;
        if (type === "stump") {
          model.scale.set(0.5, 0.5, 0.5);
          model.position.set(x, 0, z);
          model.rotateX(45); // Rotate to face upwards
        }
        if (type === "tree") {
          model.scale.set(200, 100, 100);
          model.position.set(0, 200, 0);
        }
        if (type === "smallPlant") {
          model.scale.set(9, 3, 1);
          model.rotateX(45); // Rotate to face upwards
          model.position.set(x, 0, z);
        }
        if (type === "grass") {
          model.scale.set(200, 100, 100);
          model.position.set(x, 0, z);
          model.rotateX(90); // Rotate to face upwards
        }
        if (type === "bench") {
          model.scale.set(0.1, 0.06, 0.1);
          model.position.set(x, 10, z);
          model.rotateX(45); // Rotate to face upwards
        }
        if (type === "pineTrees") {
          model.scale.set(8, 8, 8);
          model.position.set(x, -13, z);
          // model.rotateZ(45); // Rotate to face upwards
          model.rotateX(145); // Rotate to face upwards
        }
        model.updateMatrixWorld(true);
        scene.add(model);
        const box = new THREE.Box3().setFromObject(model);
        solidObjects.push(box);
      });
    });


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
    // window.addEventListener("keydown", onKeyDown);
    // window.addEventListener("keyup", onKeyUp);


    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};

export default MapScene2;
