#version 300 es
precision highp float;

in vec3 normalInterp;
in vec2 texcoordInterp;
in vec3 fragPos;

uniform vec4 diffuse;
uniform bool useTexture; // <=== NOVO

uniform vec3 keyLightPos;
uniform vec3 fillLightPos;
uniform vec3 backLightPos;

uniform vec3 keyLightColor;
uniform vec3 fillLightColor;
uniform vec3 backLightColor;

uniform bool keyLightOn;
uniform bool fillLightOn;
uniform bool backLightOn;

uniform sampler2D textureSampler;

out vec4 outColor;

// Função para calcular luz pontual difusa
vec3 calcLight(vec3 lightPos, vec3 lightColor) {
    vec3 lightDir = normalize(lightPos - fragPos);
    float diff = max(dot(normalize(normalInterp), lightDir), 0.0);
    return diff * lightColor;
}

void main() {
    vec3 norm = normalize(normalInterp);
    
    // Usa textura se estiver habilitado
    vec4 texColor = useTexture ? texture(textureSampler, texcoordInterp) : vec4(1.0);

    vec3 color = vec3(0.0);

    if (keyLightOn) {
        color += calcLight(keyLightPos, keyLightColor);
    }
    if (fillLightOn) {
        color += calcLight(fillLightPos, fillLightColor);
    }
    if (backLightOn) {
        color += calcLight(backLightPos, backLightColor);
    }

    vec3 baseColor = diffuse.rgb * texColor.rgb;
    float alpha = diffuse.a * texColor.a;

    outColor = vec4(color * baseColor, alpha);
}

