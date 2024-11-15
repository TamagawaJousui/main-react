export const positionComputeFragmentShader = /* glsl */ `
  uniform sampler2D initialPosition;
  uniform float area;
  uniform float ease;
  uniform float size;
  uniform vec2 mouse;

  float PI = 3.141592653589793;

  float atan2(in float y, in float x)
  {
      return x == 0.0 ? sign(y)* PI / 2.0 : atan(y, x);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec2 initialPosition = texture(initialPosition, uv).xy;
    vec2 previousPosition = texture(position, uv).xy;
    float newSize = 1.0;
    vec2 nextPosition = previousPosition;

    vec2 mouseDelta = mouse - previousPosition;
    float mouseDistance = distance(previousPosition, mouse);
    float d = mouseDistance * mouseDistance;
    float f = - area / d;

    vec2 posDelta = abs(initialPosition - previousPosition);


    if(mouseDistance < area) {
      float t = atan2(mouseDelta.y, mouseDelta.x);
      nextPosition.x += f * cos(t);
      nextPosition.y += f * sin(t);
      newSize = size * 1.3;
      if(min(posDelta.x, posDelta.y) > 0.0){
        newSize = size / 1.8;
      }
    }

    nextPosition += (initialPosition - nextPosition) * ease;

    // Set the final position
    gl_FragColor = vec4(nextPosition.xy, 0.0, newSize);
  }
`;

export const colorComputeFragmentShader = /* glsl */ `
  uniform sampler2D initialPosition;
  uniform float area;
  uniform float ease;
  uniform vec2 mouse;

  const vec3 colorStops[6] = vec3[6](
    vec3(0.822785754392438, 0.04373502925049377, 0.07421356837213867),
    vec3(0.9646862478936612, 0.20155625378383743, 0.04091519690055698),
    vec3(0.55201140150344, 0.7304607400847158, 0.6307571363387763),
    vec3(0.775822218312646, 0.5394794890033748, 0.5906188409113381),
    vec3(0.775822218312646, 0.5394794890033748, 0.5906188409113381),
    vec3(0.775822218312646, 0.5394794890033748, 0.5906188409113381)
  );

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    vec2 initialPosition = texture(initialPosition, uv).xy;
    vec2 currenPosition = texture(position, uv).xy;
    vec2 delta = abs(initialPosition - currenPosition);

    float mouseDistance = distance(currenPosition, mouse);
    if(mouseDistance < area && min(delta.x, delta.y) > 0.0){
      float d = mouseDistance / area;
      float weight = smoothstep(0.0, 1.0, d);
      int colorIndex = int(weight * 5.0);
      vec3 color = colorStops[colorIndex];
  
      float opacityWeight = smoothstep(0.0, 0.1, weight);
      gl_FragColor = vec4(color, weight);
    } else {
      gl_FragColor = vec4(1.0);
    }
  }
`;

// シェーダーコードを文字列として定義
export const vertexShader = /* glsl */ `
    uniform sampler2D positionTexture;
    uniform sampler2D colorTexture;
    uniform vec2 resolution;
    attribute float vertexIndex;

    varying vec3 vColor;
    varying float vOpacity;

    void main() {
      // Calculate UV coordinates
      float index = vertexIndex;
      float u = (mod(index, resolution.x) + 0.5) / resolution.x;
      float v = (floor(index / resolution.x) + 0.5) / resolution.y;
      vec2 uv = vec2(u, v);

      // Get position data from positionTexture
      vec3 pos = texture(positionTexture, uv).xyz;
      float size = texture(positionTexture, uv).w;

      vColor = texture(colorTexture, uv).xyz;
      vOpacity = texture(colorTexture, uv).w;

      vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
      gl_PointSize = size * ( 300.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;

    }
` as const;

export const fragmentShader = /* glsl */ `
    varying vec3 vColor;
    varying float vOpacity;

    void main() {
      
        gl_FragColor = vec4(vColor, 1.0);
    }
` as const;
