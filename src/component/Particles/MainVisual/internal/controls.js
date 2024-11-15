import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

export const initControls = (camera, renderer) => {
    // Create an instance of OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Optional configurations
    controls.enableDamping = true; // Enable damping (inertia), needs to call controls.update() in the animation loop
    controls.dampingFactor = 0.05; // Damping factor
    controls.minDistance = 0.01; // Minimum distance between the camera and the target
    controls.maxDistance = 100; // Maximum distance between the camera and the target
    controls.enablePan = true; // Enable panning
    controls.enableZoom = true; // Enable zooming

    return controls;
};

export const initStats = () => {
    const stats = new Stats();
    document.body.appendChild(stats.dom);

    return stats;
};

export const initAxes = (scene) => {
    // Create an axes helper object with a length of 5
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);
};

export const initRuler = (scene) => {
    // Add rulers on the X, Y, Z axes with a length of 5 and an interval of 1
    const xRuler = createRuler("x", 3, 1);
    const yRuler = createRuler("y", 3, 1);
    const zRuler = createRuler("z", 3, 1);

    scene.add(xRuler);
    scene.add(yRuler);
    scene.add(zRuler);
};

export const initCaption = (scene) => {
    // Create a font loader
    const fontLoader = new FontLoader();
    // Load the font file
    fontLoader.load(
        "node_modules/three/examples/fonts/helvetiker_regular.typeface.json",
        (font) => {
            // Create letter markers for X, Y, Z
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

            const textOptions = {
                font: font,
                size: 0.2,
                depth: 0.01,
            };

            // X axis marker
            const xTextGeometry = new TextGeometry("X", textOptions);
            const xTextMesh = new THREE.Mesh(xTextGeometry, textMaterial);
            xTextMesh.position.set(3.5, 0, 0); // Place at the end of the X axis
            scene.add(xTextMesh);

            // Y axis marker
            const yTextGeometry = new TextGeometry("Y", textOptions);
            const yTextMesh = new THREE.Mesh(yTextGeometry, textMaterial);
            yTextMesh.position.set(0, 3.5, 0); // Place at the end of the Y axis
            scene.add(yTextMesh);

            // Z axis marker
            const zTextGeometry = new TextGeometry("Z", textOptions);
            const zTextMesh = new THREE.Mesh(zTextGeometry, textMaterial);
            zTextMesh.position.set(0, 0, 3.5); // Place at the end of the Z axis
            scene.add(zTextMesh);
        }
    );
};

// Add ruler function
const createRuler = (axis, length, interval) => {
    const rulerGroup = new THREE.Group();
    for (let i = -length; i <= length; i += interval) {
        const markerGeometry = new THREE.BufferGeometry();
        const markerVertices = [];

        if (axis === "x") {
            markerVertices.push(i, 0, 0, i, 0.2, 0); // Create vertical segments on the X axis
        } else if (axis === "y") {
            markerVertices.push(0, i, 0, 0.2, i, 0); // Create horizontal segments on the Y axis
        } else if (axis === "z") {
            markerVertices.push(0, 0, i, 0, 0.2, i); // Create vertical segments on the Z axis
        }

        markerGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(markerVertices, 3)
        );
        const markerMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const marker = new THREE.Line(markerGeometry, markerMaterial);
        rulerGroup.add(marker);
    }
    return rulerGroup;
};
