import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import './App.css';

function Scene() {
  const { camera, gl, scene } = useThree();
  const controlsRef = useRef();
  const dragControlsRef = useRef();
  const interactableObjects = useRef([]);
  const outlineMeshRef = useRef();
  const raycaster = new THREE.Raycaster();

  useEffect(() => {
    const outlineColor = 0xffff00; // Yellow for the outline
    const outlineMaterial = new THREE.MeshBasicMaterial({ color: outlineColor, side: THREE.BackSide });
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
    outlineMesh.scale.multiplyScalar(1.05);
    outlineMesh.visible = false; // Initially not visible
    scene.add(outlineMesh);
    outlineMeshRef.current = outlineMesh;
    

    const dragControls = new DragControls(interactableObjects.current, camera, gl.domElement);
    dragControlsRef.current = dragControls;

    dragControls.addEventListener('dragstart', (event) => {
      controlsRef.current.enabled = false;
      const object = event.object;
      outlineMesh.position.copy(object.position);
      outlineMesh.rotation.copy(object.rotation);
      outlineMesh.scale.copy(object.scale).multiplyScalar(1.05);
      outlineMesh.visible = true;
    });

    dragControls.addEventListener('drag', (event) => {
      const object = event.object;
      outlineMesh.position.copy(object.position);
      outlineMesh.rotation.copy(object.rotation);
      outlineMesh.scale.copy(object.scale).multiplyScalar(1.05);
    });

    dragControls.addEventListener('dragend', () => {
      controlsRef.current.enabled = true;
      outlineMesh.visible = false;
    });

    return () => {
      dragControls.dispose();
    };
  }, [camera, gl.domElement, scene]);

  const logHierarchy = (object, indent = '') => {
    let content = '';
    if (object.name !== 'grid' && object.name !== '') {
      content += indent + object.name + '<br>'; // Use <br> for line breaks in HTML
    }
    for (let i = 0; i < object.children.length; i++) {
      content += logHierarchy(object.children[i], indent + '    '); // Use non-breaking spaces for indentation in HTML
    }
    return content;
  };

  const hierarchy = logHierarchy(scene);
  console.log(hierarchy);

  const handlePointerDown = (event) => {
    const coords = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(coords, camera);
    const intersects = raycaster.intersectObjects(interactableObjects.current, true);
  
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.name !== 'plane') {
        const outlineMesh = outlineMeshRef.current;
        outlineMesh.position.copy(obj.position);
        outlineMesh.rotation.copy(obj.rotation);
        outlineMesh.scale.copy(obj.scale).multiplyScalar(1.05);
        outlineMesh.visible = true;
        outlineMesh.userData.lastOutlined = obj;
      }
    } else {
      outlineMeshRef.current.visible = false; // Hide the outline if no interactable object is clicked
    }
  };
  

  return (
    <>
      <gridHelper args={[100, 10]} />
      <directionalLight
        color={0xffffff}
        intensity={10}
        position={[5, 5, 5]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={500}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={0.0001}
      />
      <mesh
        position={[-2, 0.6, 0]}
        castShadow
        name="MyCube"
        ref={(mesh) => mesh && interactableObjects.current.push(mesh)}
      >
        <boxGeometry />
        <meshPhongMaterial color="grey" />
      </mesh>
      <mesh
        position={[2, 0.6, 0]}
        castShadow
        name="MyCube1"
        ref={(mesh) => mesh && interactableObjects.current.push(mesh)}
      >
        <boxGeometry />
        <meshPhongMaterial color="grey" />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        name="plane"
      >
        <planeGeometry args={[100, 100]} />
        <meshPhongMaterial color={0xffffff} side={THREE.DoubleSide} />
      </mesh>
      <OrbitControls ref={controlsRef} enableDamping />
      <mesh ref={outlineMeshRef}>
        <boxGeometry />
        <meshBasicMaterial color={0xffff00} side={THREE.BackSide} />
      </mesh>
      <mesh onPointerDown={handlePointerDown} />
    </>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [2, 2, 2] }} style={{ backgroundColor: 'grey' }}>
      <Scene />
    </Canvas>
  );
}
