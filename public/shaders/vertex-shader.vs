#version 300 es
    in vec4 position;
    in vec3 normal;
    in vec2 texcoord;   // sem prefixo 'a_'

    uniform mat4 projection, view, world; // sem prefixo 'u_'

    out vec3 normalInterp;  // sem prefixo 'v_'
    out vec2 texcoordInterp;

    void main() {
        gl_Position = projection * view * world * position;
        normalInterp = mat3(world) * normal;
        texcoordInterp = texcoord;
    }
