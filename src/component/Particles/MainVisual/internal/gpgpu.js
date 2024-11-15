import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";

import {
    positionComputeFragmentShader,
    colorComputeFragmentShader,
    backgroundComputeFragmentShader,
} from "./shaders.js";

// Create an instance of GPUComputationRenderer
export const initGPUComputationRenderer = (size, renderer) => {
    const gpuCompute = new GPUComputationRenderer(size, size, renderer);

    // Initialize position data, each particle's position is a random point on a sphere
    const spherePoints = window.spherePostions;
    const sphereColors = window.sphereColors;

    // Create initial position texture
    const initialPosition = gpuCompute.createTexture();
    initialPosition.image.data.set(spherePoints);

    // Create color texture
    const initialColor = gpuCompute.createTexture();
    initialColor.image.data.set(sphereColors);

    // Create texture for background point cloud positions
    const backgroundPosition = gpuCompute.createTexture();
    backgroundPosition.image.data.set(spherePoints);

    // Add position variable and save reference
    const positionVariable = gpuCompute.addVariable(
        "position",
        positionComputeFragmentShader,
        initialPosition
    );

    // Add color variable and save reference
    const colorVariable = gpuCompute.addVariable("color", colorComputeFragmentShader, initialColor);

    // Create variable for background positions and update it using backgroundComputeFragmentShader
    const backgroundPositionVariable = gpuCompute.addVariable(
        "backgroundPosition",
        backgroundComputeFragmentShader, // Fragment shader for updating background point cloud
        backgroundPosition
    );

    // Set variable dependencies, ensuring positionVariable depends on backgroundPositionVariable
    gpuCompute.setVariableDependencies(colorVariable, [
        colorVariable,
        positionVariable,
        backgroundPositionVariable,
    ]);
    gpuCompute.setVariableDependencies(positionVariable, [
        positionVariable,
        backgroundPositionVariable,
    ]);
    gpuCompute.setVariableDependencies(backgroundPositionVariable, [backgroundPositionVariable]);

    // Check for shader errors
    const error = gpuCompute.init();
    if (error !== null) {
        console.error(error);
    }

    return {
        gpuCompute,
        positionVariable,
        colorVariable,
        backgroundPositionVariable,
    };
};
