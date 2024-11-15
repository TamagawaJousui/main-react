import * as THREE from "three";

import { vertexShader, fragmentShader } from "./shaders.js";

export const initParticle = (size) => {
    // Create geometry with 8 vertices
    const geometry = new THREE.BufferGeometry();
    const numParticles = size * size; // 8 particles
    const colors = window.sphereColors; // Each particle has R, G, B color

    // Create vertexIndex attribute
    const vertexIndices = new Float32Array(numParticles);
    for (let i = 0; i < numParticles; i++) {
        vertexIndices[i] = i;
    }
    geometry.setAttribute("vertexIndex", new THREE.BufferAttribute(vertexIndices, 1));

    // Create position attribute (still needed because THREE.Points requires it, but values will be overridden by the shader)
    const positions = new Float32Array(numParticles * 3);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));

    // Create material using custom shaders
    const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
            colorTexture: { value: null }, // Color texture
            positionTexture: { value: null }, // Position texture
            resolution: { value: new THREE.Vector2(size, size) },
            pointSize: { value: 1.0 },
            transparent: { value: 0.7 },
            useColor: { value: true },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });

    // Create points
    const points = new THREE.Points(geometry, material);
    return points;
};