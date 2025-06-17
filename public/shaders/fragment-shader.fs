#version 300 es
precision highp float;

in vec3 normalInterp;
in vec2 texcoordInterp;

uniform vec4 diffuse;
uniform vec3 lightDirection;

uniform sampler2D textureSampler;  // sem prefixo

out vec4 outColor;

void main() {
    vec3 norm = normalize(normalInterp);
    float light = dot(lightDirection, norm) * 0.5 + 0.5;

    vec4 texColor = texture(textureSampler, texcoordInterp);
    vec3 color = texColor.rgb * diffuse.rgb * light;
    float alpha = texColor.a * diffuse.a;

    outColor = vec4(color, alpha);
}

