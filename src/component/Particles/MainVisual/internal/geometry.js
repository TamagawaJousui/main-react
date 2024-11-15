import * as THREE from "three";
export const initSpherePoints = (numParticles, radius) => {
    const postions = getSpherePointsPostion(numParticles, radius);
    const colors = getSpherePointsColor(postions, radius);

    window.spherePostions = postions;
    window.sphereColors = colors;
};

const getSpherePointsPostion = (numParticles, radius) => {
    const postions = new Float32Array(numParticles * 4);
    for (let i = 0; i < postions.length; i += 4) {
        [postions[i], postions[i + 1], postions[i + 2]] = getRandomPositionInSphere(radius); // x, y, z
        postions[i + 3] = 1.0; // w
    }
    return postions;
};

const getSpherePointsColor = (postions, radius) => {
    // Generate particles on the sphere and assign different colors to each particle
    const numParticles = postions.length / 4;
    const colors = new Float32Array(numParticles * 4);
    for (let i = 0; i < numParticles; i++) {
        const [x, y, z] = postions.slice(i * 4, i * 4 + 3); // Get position

        // Get color based on position
        const distance = Math.sqrt(x * x + y * y + z * z);
        const [r, g, b] = getColorByPositionDistance(distance, radius);
        colors[i * 4] = r;
        colors[i * 4 + 1] = g;
        colors[i * 4 + 2] = b;
        colors[i * 3 + 3] = 1.0;
    }
    return colors;
};

// Generate random points on the surface of the sphere
// const getRandomPositionOnSphere = (radius) => {
//     const u = Math.random();
//     const v = Math.random();
//     const theta = 2 * Math.PI * u;
//     const phi = Math.acos(2 * v - 1);

//     const x = radius * Math.sin(phi) * Math.cos(theta);
//     const y = radius * Math.sin(phi) * Math.sin(theta);
//     const z = radius * Math.cos(phi);

//     return [x, y, z];
// };

// Generate uniformly distributed random points inside the sphere
const getRandomPositionInSphere = (radius) => {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = Math.cbrt(Math.random()) * radius; // Random radius, uniformly distributed inside the sphere

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    return [x, y, z];
};

// Define the colors of the spherical regions
// const faceColors = {
//     "+X": [1.0, 0.2745, 0.0], // Vivid orange-red
//     "-X": [1.0, 0.1961, 0.0], // Bright red-orange
//     "+Y": [1.0, 0.3333, 0.0], // Enthusiastic bright orange
//     "-Y": [1.0, 0.1569, 0.0], // Energetic deep orange-red
//     "+Z": [1.0, 0.4, 0.0], // Bright orange-red
//     "-Z": [1.0, 0.2353, 0.0], // Vibrant orange
// };

// Determine the region based on the spatial position of the vertex
// const getColorByPositionArea = (x, y, z) => {
//     if (Math.abs(x) >= Math.abs(y) && Math.abs(x) >= Math.abs(z)) {
//         return x >= 0 ? faceColors["+X"] : faceColors["-X"];
//     } else if (Math.abs(y) >= Math.abs(x) && Math.abs(y) >= Math.abs(z)) {
//         return y >= 0 ? faceColors["+Y"] : faceColors["-Y"];
//     } else {
//         return z >= 0 ? faceColors["+Z"] : faceColors["-Z"];
//     }
// };

// Create a color palette for gradient
const colorStops = [
    new THREE.Color(0xede7e9), // Color closest to the center of the sphere
    new THREE.Color(0xeb8f99),
    new THREE.Color(0xea3b4d),
    new THREE.Color(0xfb7c39),
    new THREE.Color(0xc4ded0),
    new THREE.Color(0xe4c2ca), // Color farthest from the center of the sphere
];

// Function: Map color based on distance
const getColorByPositionDistance = (distance, maxDistance) => {
    const ratio = distance / maxDistance;
    const numStops = colorStops.length;
    const scaledRatio = ratio * (numStops - 1);
    const lowerIndex = Math.floor(scaledRatio);
    const upperIndex = Math.min(lowerIndex + 1, numStops - 1);
    const blendFactor = scaledRatio - lowerIndex;

    const color = new THREE.Color();
    color.lerpColors(colorStops[lowerIndex], colorStops[upperIndex], blendFactor);
    return [color.r, color.g, color.b];
};
