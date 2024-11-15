import pnoise3D from "./shaders/classicnoise3D.vert";

export const positionComputeFragmentShader = /* glsl */ `
  ${pnoise3D} // Include GLSL code for Perlin noise function

  uniform mat4 noiseTransformMatrix;        // 4x4 transformation matrix for noise calculation
  uniform mat4 positionTransformMatrix;     // New 4x4 transformation matrix for particle position transformation
  uniform vec3 rep;                         // Periodic parameter
  uniform float seed;                       // Seed parameter
  
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // Get position from the previous frame
    vec4 previousPosition = texture(position, uv);

    // Get the position of the background point cloud
    vec4 backgroundPosition = texture(backgroundPosition, uv);
    
    // Use noiseTransformMatrix for noise calculation
    vec3 transformedPosition = (noiseTransformMatrix * vec4(previousPosition.xyz, 1.0)).xyz;
    float noiseValue = pnoise(transformedPosition, rep, seed);  // Calculate noise value, range [-1, 1]

    // Use positionTransformMatrix to transform previousPosition
    vec3 newPosition = (positionTransformMatrix * vec4(previousPosition.xyz, 1.0)).xyz;

    // Linearly interpolate between previousPosition and newPosition, using noiseValue as the weight
    vec3 interpolatedPosition = mix(previousPosition.xyz, newPosition, noiseValue);

    // Mix interpolatedPosition and transformedBackgroundPosition, alpha is 0.99
    vec3 finalPosition = mix(backgroundPosition.xyz, interpolatedPosition.xyz, 0.99);

    // Set the final position
    gl_FragColor = vec4(finalPosition.xyz, 1.0);
  }
`;

export const colorComputeFragmentShader = /* glsl */ `
  uniform vec3 colors[6];
  uniform float radius;
  uniform int colorPattern;

  // Function: Determine the area based on the vertex's spatial position
  vec3 getColorByPositionArea(float x, float y, float z) {
    vec3 color_X_plus = colors[0];
    vec3 color_X_minus = colors[1];
    vec3 color_Y_plus = colors[2];
    vec3 color_Y_minus = colors[3];
    vec3 color_Z_plus = colors[4];
    vec3 color_Z_minus = colors[5];
    if (abs(x) >= abs(y) && abs(x) >= abs(z)) {
      return x >= 0.0 ? color_X_plus : color_X_minus;
    } else if (abs(y) >= abs(x) && abs(y) >= abs(z)) {
      return y >= 0.0 ? color_Y_plus : color_Y_minus;
    } else {
      return z >= 0.0 ? color_Z_plus : color_Z_minus;
    }
  }

  // Function: Map color based on distance
  vec3 getColorByPositionDistance(float distance, float maxDistance) {
    vec3 colorStops[6] = colors;

    // Calculate distance ratio
    float ratio = distance / maxDistance;
    int numStops = 6;
    float scaledRatio = ratio * float(numStops - 1);
    int lowerIndex = int(floor(scaledRatio));
    int upperIndex = min(lowerIndex + 1, numStops - 1);
    float blendFactor = scaledRatio - float(lowerIndex);

    // Blend colors
    vec3 color = mix(colorStops[lowerIndex], colorStops[upperIndex], blendFactor);
    return color;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // Get the position of the background point cloud
    vec4 backgroundPosition = texture(backgroundPosition, uv);

    vec3 color = vec3(1.0);
    
    if (colorPattern == 0) {
      color = getColorByPositionArea(backgroundPosition.x, backgroundPosition.y, backgroundPosition.z);
    } else if (colorPattern == 1) {
      // Calculate maximum distance and current distance
      float maxDistance = radius;
      float distance = length(backgroundPosition.xyz);
      color = getColorByPositionDistance(distance, maxDistance);
    }

    // Set fragment color
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const backgroundComputeFragmentShader = /* glsl */ `
  uniform mat4 backgroundTransformMatrix;  // Transformation matrix for the background point cloud

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // Get the position of the background point cloud from the previous frame
    vec4 backgroundPosition = texture(backgroundPosition, uv);  // Get the 4-component position of the background point cloud

    // Apply the transformation matrix to the background point cloud
    vec3 transformedBackgroundPosition = (backgroundTransformMatrix * vec4(backgroundPosition.xyz, 1.0)).xyz;

    // Set the new position of the background point cloud
    gl_FragColor = vec4(transformedBackgroundPosition.xyz, 1.0);
  }
`;

export const vertexShader = /* glsl */ `
  uniform sampler2D positionTexture;
  uniform sampler2D colorTexture;
  uniform vec2 resolution;
  uniform float pointSize;
  attribute float vertexIndex;
  attribute vec4 color;
  varying vec4 vColor; // Used to pass color to the fragment shader

  void main() {
    // Calculate UV coordinates
    float index = vertexIndex;
    float u = (mod(index, resolution.x) + 0.5) / resolution.x;
    float v = (floor(index / resolution.x) + 0.5) / resolution.y;
    vec2 uv = vec2(u, v);

    // Get position data from positionTexture
    vec4 posData = texture(positionTexture, uv);
    vec3 pos = posData.xyz;

    // Get color data from colorTexture
    vColor = texture(colorTexture, uv);

    // Transform to view space
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Set point size
    gl_PointSize = pointSize;

    // Set final position
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform float transparent;  // Transparency
  uniform bool useColor;      // Whether to use color
  varying vec4 vColor; // Receive color from the vertex shader

  void main() {
      gl_FragColor = vec4(useColor ? vColor.rgb : vec3(1.0), transparent); // Use the passed color
  }
`;
