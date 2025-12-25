
export const COLORS = {
  EMERALD_DARK: '#043927',
  GOLD_BRIGHT: '#FFD700',
  GOLD_LUXURY: '#D4AF37',
  RED_LUXURY: '#8B0000',
  WHITE_SOFT: '#F5F5F5',
};

export const SETTINGS = {
  FOLIAGE_COUNT: 15000,
  ORNAMENT_COUNT: 60,
  POLAROID_COUNT: 12,
  CHAOS_RADIUS: 12,
  TREE_HEIGHT: 12,
  TREE_RADIUS: 5,
};

export const FOLIAGE_SHADER = {
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 chaosPosition;
    attribute vec3 targetPosition;
    varying vec3 vColor;

    void main() {
      vec3 pos = mix(targetPosition, chaosPosition, uProgress);
      
      // Add subtle waving motion
      pos.x += sin(uTime * 0.5 + pos.y) * 0.05 * uProgress;
      pos.z += cos(uTime * 0.4 + pos.y) * 0.05 * uProgress;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 3.0 * (20.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      
      // Color based on height and state
      vColor = mix(vec3(0.015, 0.22, 0.15), vec3(0.83, 0.68, 0.21), clamp(pos.y / 12.0, 0.0, 1.0));
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    void main() {
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.4, 0.5, r);
      gl_FragColor = vec4(vColor, alpha);
    }
  `
};
