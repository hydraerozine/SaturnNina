<script>
    import { onMount } from 'svelte';
    import * as THREE from 'three';
    import { goto } from '$app/navigation';
  
    let canvasContainer;
  
    onMount(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      canvasContainer.appendChild(renderer.domElement);
  
      // Create Saturn's body
      const geometry = new THREE.SphereGeometry(1, 64, 64);
      const material = new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true });
      const saturn = new THREE.Mesh(geometry, material);
      scene.add(saturn);
  
      // Create Saturn's rings
      const ringGeometry = new THREE.RingGeometry(1.4, 2, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff, side: THREE.DoubleSide, wireframe: true });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2.4;
      ring.rotation.y = Math.PI / 4;
      scene.add(ring);
  
      // Add stars to the background
      function addStar() {
        const starGeometry = new THREE.SphereGeometry(0.05, 24, 24);
        const starMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(20));
        star.position.set(x, y, z);
        scene.add(star);
      }
      Array(200).fill().forEach(addStar);
  
      camera.position.set(2, 2, 2);
      camera.lookAt(0, 0, 0);
  
      function animate() {
        requestAnimationFrame(animate);
        saturn.rotation.y += 0.01;
        ring.rotation.z += 0.005;
        renderer.render(scene, camera);
      }
      animate();
  
      // Handle window resize
      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    });
  
    function enterSite() {
      goto('/main');
    }
  </script>
  
  <main>
    <div class="content">
      <h1>Welcome to Saturn DEX</h1>
      <h2>Managed by NINA</h2>
      <button on:click={enterSite}>Enter</button>
    </div>
    <div bind:this={canvasContainer} class="canvas-container"></div>
  </main>
  
  <style>
    main {
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #ffffff;
      font-family: Arial, sans-serif;
      background-color: black;
    }
    .content {
      position: absolute;
      z-index: 1;
      text-align: center;
    }
    h1, h2 {
      margin: 0;
      padding: 10px;
    }
    button {
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 18px;
      background-color: #00aaff;
      color: white;
      border: none;
      cursor: pointer;
    }
    .canvas-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  </style>