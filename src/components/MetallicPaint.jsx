/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
"use client";

import { useEffect, useRef, useState } from "react";
import "./Metal.css";

// Default parameters for the metallic paint effect
const defaultParams = {
  patternScale: 2,
  refraction: 0.015,
  edge: 1,
  patternBlur: 0.005,
  liquid: 0.07,
  speed: 0.3,
};

// Vertex shader remains the same
const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 a_position;
out vec2 vUv;
void main() {
    vUv = .5 * (a_position + 1.);
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// <<< FIX: Restored the full fragment shader logic
// This shader uses time and parameters to distort the texture coordinates,
// creating a moving, liquid-like effect.
const liquidFragSource = `#version 300 es
precision mediump float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_img_ratio;

// Uniforms from params
uniform float u_patternScale;
uniform float u_refraction;
uniform float u_edge;
uniform float u_patternBlur;
uniform float u_liquid;

// Noise function to create procedural patterns
float noise(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
}

// Function to create a liquid-like distortion
vec2 liquidEffect(vec2 uv, float time) {
    vec2 p = uv * u_patternScale;
    float n = noise(p + time);
    float ramp = (1.0 - length(uv - 0.5)) * u_edge;
    vec2 pos = vec2(
        noise(p + n + time),
        noise(p + n + time + 10.0)
    ) - 0.5;
    
    pos *= ramp * u_refraction;
    
    float focus = smoothstep(u_liquid, 0.0, length(uv - 0.5));
    pos *= focus;
    
    return smoothstep(0.0, 1.0, uv + pos);
}

void main() {
    // Correct for aspect ratio differences between canvas and image
    vec2 ratio = vec2(
        min(u_ratio / u_img_ratio, 1.0),
        min(u_img_ratio / u_ratio, 1.0)
    );
    vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    // Apply the liquid distortion
    vec2 distortedUv = liquidEffect(uv, u_time * 0.001);

    // Add a blur effect to the pattern
    vec4 color = vec4(0.0);
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 offset = vec2(float(x), float(y)) * u_patternBlur;
            color += texture(u_image_texture, distortedUv + offset);
        }
    }
    color /= 9.0;
    
    fragColor = color;
}`;

export default function MetallicPaint({ params = defaultParams }) {
  const canvasRef = useRef(null);
  const [gl, setGl] = useState(null);
  const [uniforms, setUniforms] = useState({});
  const [image, setImage] = useState(null);
  const totalAnimationTime = useRef(0);
  const lastRenderTime = useRef(0);

  // Load image from URL directly (no changes here)
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://static.vexels.com/media/users/3/136086/preview/grid-earth-icon.png";
    img.onload = () => setImage(img);
    img.onerror = console.error;
  }, []);

  // Initialize WebGL context, shaders, and uniform locations
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!gl) return;

    function createShader(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(liquidFragSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // <<< FIX: Get locations for ALL uniforms, not just a few.
    const uniformLocations = {
      u_image_texture: gl.getUniformLocation(program, "u_image_texture"),
      u_time: gl.getUniformLocation(program, "u_time"),
      u_ratio: gl.getUniformLocation(program, "u_ratio"),
      u_img_ratio: gl.getUniformLocation(program, "u_img_ratio"),
    };
    // Dynamically get locations for all keys in the params object
    for (const key in params) {
      const uniformKey = `u_${key}`;
      uniformLocations[uniformKey] = gl.getUniformLocation(program, uniformKey);
    }
    setUniforms(uniformLocations);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    setGl(gl);
  }, []); // params removed from dependency array to avoid re-init on prop change

  // Upload texture and set initial uniform values
  useEffect(() => {
    if (!gl || !image || Object.keys(uniforms).length === 0) return;

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(uniforms.u_image_texture, 0);

    const canvas = canvasRef.current;
    canvas.width = image.width;
    canvas.height = image.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    // <<< FIX: Set all the uniforms based on params and dimensions
    gl.uniform1f(uniforms.u_ratio, canvas.width / canvas.height);
    gl.uniform1f(uniforms.u_img_ratio, image.width / image.height);

    for (const key in params) {
      const uniformKey = `u_${key}`;
      if (uniforms[uniformKey]) {
          gl.uniform1f(uniforms[uniformKey], params[key]);
      }
    }

    return () => gl.deleteTexture(texture);
  }, [gl, image, uniforms, params]);

  // Animation loop (only updates time)
  useEffect(() => {
    if (!gl || Object.keys(uniforms).length === 0) return;

    let renderId;
    const render = (time) => {
      const deltaTime = time - lastRenderTime.current;
      lastRenderTime.current = time;
      // Multiply by 0.1 to slow it down a bit from the original params.speed
      totalAnimationTime.current += deltaTime * params.speed * 0.1;
      
      gl.uniform1f(uniforms.u_time, totalAnimationTime.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      renderId = requestAnimationFrame(render);
    };

    lastRenderTime.current = performance.now();
    renderId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(renderId);
  }, [gl, uniforms, params.speed]);

  return <canvas ref={canvasRef} className="block w-full h-full object-contain" />;
}