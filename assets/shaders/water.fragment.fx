precision highp float;

varying vec2 vUV;

uniform float time;

void main() {

    vec2 uv = vUV;

    float water = 0.5 + 0.5 * sin(uv.x * 10.0 + time * 2.0);

    vec3 deepColor = vec3(0.01, 0.05, 0.08);
    vec3 shallowColor = vec3(0.02, 0.2, 0.25);

    vec3 color = mix(deepColor, shallowColor, water);

    gl_FragColor = vec4(color, 0.75);
}