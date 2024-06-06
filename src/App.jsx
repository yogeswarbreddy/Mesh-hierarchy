import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import MovableWindow from './MovableWindow';
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
    
    const dragControls = new DragControls(interactableObjects.current, camera, gl.domElement);
    dragControlsRef.current = dragControls;    

    dragControls.addEventListener('dragstart', (event) => {
        controlsRef.current.enabled = false;
        const object = event.object;
        const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.BackSide });
        
        // Create a new geometry that matches the object's geometry
        const outlineGeometry = object.geometry.clone();
        outlineGeometry.scale(1.05, 1.05, 1.05); // Scale it slightly larger to create the outline effect
        
        // If there's an existing outline mesh, dispose of its geometry first
        if (outlineMeshRef.current) {
          outlineMeshRef.current.geometry.dispose();
        }
        
        // Create a new outline mesh with the new geometry and material
        const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outlineMesh.position.copy(object.position);
        outlineMesh.rotation.copy(object.rotation);
        outlineMesh.visible = true;
        
        // Replace the reference to the new outline mesh
        outlineMeshRef.current = outlineMesh;
        
        // Add the new outline mesh to the scene
        scene.add(outlineMesh);
      });
    
      dragControls.addEventListener('drag', (event) => {
        const object = event.object;
        // Update the position and scale of the outline mesh to follow the object
        if (outlineMeshRef.current) {
          outlineMeshRef.current.position.copy(object.position);
          outlineMeshRef.current.scale.copy(object.scale).multiplyScalar(1.05);
        }
      });
      dragControls.addEventListener('dragend', () => {
        controlsRef.current.enabled = true;
        if (outlineMeshRef.current) {
          outlineMeshRef.current.visible = false; // Hide the outline mesh
          outlineMeshRef.current.userData.lastOutlined = null; // Clear the reference to the last outlined object
        }
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
          outlineMesh.userData.lastOutlined = obj; // Set the last outlined object
        }
      } else {
        outlineMeshRef.current.visible = false;
      }
    };
useFrame(() => {
        if (outlineMeshRef.current && outlineMeshRef.current.userData.lastOutlined && !dragControlsRef.current.isDragging()) {
          const outlinedObject = outlineMeshRef.current.userData.lastOutlined;
          outlineMeshRef.current.position.copy(outlinedObject.position);
          outlineMeshRef.current.scale.copy(outlinedObject.scale).multiplyScalar(1.05);
        }
      });
      
  

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
        position = {[0,2,0]}
        castShadow
        name='sphere'
        ref={(mesh) => mesh && interactableObjects.current.push(mesh)}>
        <sphereGeometry args={[0.5, 32, 32]} />
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
      <mesh onPointerDown={handlePointerDown} />
    </>
  );
}

export default function App() {
  return (
    <>
      <Canvas camera={{ position: [2, 2, 2] }} style={{ backgroundColor: 'grey' }}>
        <Scene />
      </Canvas>
      <MovableWindow />
    </>
  );
}