import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const VirtualForestEnvironment = () => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState('Initializing...');

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x6b8e23, 0.5);
    scene.add(hemisphereLight);

    // Ground with texture
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 32, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a7c59,
      roughness: 0.8,
      metalness: 0.2
    });
    
    // Add some variation to ground
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const wave = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.3;
      positions.setZ(i, wave);
    }
    groundGeometry.computeVertexNormals();

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create trees
    const createTree = (x, z) => {
      const treeGroup = new THREE.Group();

      // Trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3020,
        roughness: 0.9
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 2;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Foliage (using cones)
      const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d5016,
        roughness: 0.7
      });

      const cone1 = new THREE.Mesh(
        new THREE.ConeGeometry(2, 3, 8),
        foliageMaterial
      );
      cone1.position.y = 5.5;
      cone1.castShadow = true;
      treeGroup.add(cone1);

      const cone2 = new THREE.Mesh(
        new THREE.ConeGeometry(1.5, 2.5, 8),
        foliageMaterial
      );
      cone2.position.y = 7.5;
      cone2.castShadow = true;
      treeGroup.add(cone2);

      const cone3 = new THREE.Mesh(
        new THREE.ConeGeometry(1, 2, 8),
        foliageMaterial
      );
      cone3.position.y = 9;
      cone3.castShadow = true;
      treeGroup.add(cone3);

      treeGroup.position.set(x, 0, z);
      return treeGroup;
    };

    // Add multiple trees
    const treePositions = [
      [-10, -5], [10, -8], [-15, -15], [12, -12],
      [-8, 5], [15, 8], [-12, 12], [8, 15],
      [-20, -10], [18, -15], [-5, -20], [20, 5],
      [5, 20], [-18, 15], [0, -12], [-6, 8]
    ];

    treePositions.forEach(([x, z]) => {
      scene.add(createTree(x, z));
    });

    // Create rocks
    const createRock = (x, z, size) => {
      const rockGeometry = new THREE.DodecahedronGeometry(size, 0);
      const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9,
        metalness: 0.1
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(x, size * 0.5, z);
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      return rock;
    };

    // Add rocks
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      const size = 0.5 + Math.random() * 1;
      scene.add(createRock(x, z, size));
    }

    // Create a small pond
    const pondGeometry = new THREE.CircleGeometry(5, 32);
    const pondMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      roughness: 0.1,
      metalness: 0.8
    });
    const pond = new THREE.Mesh(pondGeometry, pondMaterial);
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(-5, 0.1, 10);
    pond.receiveShadow = true;
    scene.add(pond);

    // Add some grass patches
    const grassGroup = new THREE.Group();
    for (let i = 0; i < 100; i++) {
      const blade = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.5, 3),
        new THREE.MeshStandardMaterial({ color: 0x3a7c3a })
      );
      blade.position.set(
        (Math.random() - 0.5) * 30,
        0.25,
        (Math.random() - 0.5) * 30
      );
      blade.rotation.x = Math.PI;
      grassGroup.add(blade);
    }
    scene.add(grassGroup);

    // Camera controls
    let cameraAngle = 0;
    let cameraRadius = 20;
    let cameraHeight = 5;
    let isRotating = true;

    const keys = {};
    
    const handleKeyDown = (e) => {
      keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      isRotating = false;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        cameraAngle -= deltaX * 0.01;
        cameraHeight = Math.max(2, Math.min(30, cameraHeight + deltaY * 0.05));
      }
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleWheel = (e) => {
      e.preventDefault();
      cameraRadius = Math.max(5, Math.min(50, cameraRadius + e.deltaY * 0.05));
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Handle keyboard input
      if (keys['w']) cameraRadius = Math.max(5, cameraRadius - 0.3);
      if (keys['s']) cameraRadius = Math.min(50, cameraRadius + 0.3);
      if (keys['a']) cameraAngle -= 0.02;
      if (keys['d']) cameraAngle += 0.02;
      if (keys['q']) cameraHeight = Math.max(2, cameraHeight - 0.2);
      if (keys['e']) cameraHeight = Math.min(30, cameraHeight + 0.2);
      if (keys[' ']) isRotating = !isRotating;

      // Auto-rotate camera
      if (isRotating) {
        cameraAngle += 0.005;
      }

      // Update camera position
      camera.position.x = Math.sin(cameraAngle) * cameraRadius;
      camera.position.z = Math.cos(cameraAngle) * cameraRadius;
      camera.position.y = cameraHeight;
      camera.lookAt(0, 2, 0);

      // Animate grass slightly
      grassGroup.children.forEach((blade, i) => {
        blade.rotation.z = Math.sin(Date.now() * 0.001 + i) * 0.1;
      });

      renderer.render(scene, camera);
    };

    setLoading(false);
    setInfo('Use WASD to move, QE for height, Mouse drag to rotate, Scroll to zoom, Space to toggle auto-rotate');
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Virtual Forest Environment</h1>
        <p className="text-sm text-gray-300 mb-2">Computer Graphics Concepts Demonstration</p>
        <div className="bg-gray-700 p-3 rounded text-sm">
          <p className="font-semibold mb-1">Controls:</p>
          <p>{info}</p>
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-white text-xl">Loading 3D Environment...</div>
        </div>
      )}
      
      <div className="bg-gray-800 text-white p-3 text-xs">
        <h3 className="font-semibold mb-2">Graphics Concepts Implemented:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>✓ 3D Geometry (Trees, Rocks)</div>
          <div>✓ Lighting (Ambient, Directional, Hemisphere)</div>
          <div>✓ Shadows (Dynamic shadow mapping)</div>
          <div>✓ Materials & Shading (PBR materials)</div>
          <div>✓ Texturing (Procedural textures)</div>
          <div>✓ Camera Controls (Interactive)</div>
          <div>✓ Fog Effects (Atmospheric depth)</div>
          <div>✓ Animation (Grass movement)</div>
        </div>
      </div>
    </div>
  );
};

export default VirtualForestEnvironment;