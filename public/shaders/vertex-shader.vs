#version 300 es
in vec4 position;
in vec3 normal;
in vec2 texcoord;

uniform mat4 projection, view, world;

out vec3 normalInterp;
out vec2 texcoordInterp;
out vec3 fragPos; // posição no espaço do mundo

void main() {
    gl_Position = projection * view * world * position;
    normalInterp = mat3(world) * normal;
    texcoordInterp = texcoord;
    fragPos = (world * position).xyz;
}

