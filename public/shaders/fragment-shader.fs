#version 300 es
precision highp float;

in vec3 normalInterp;
in vec2 texcoordInterp;
in vec3 fragPos;

uniform vec4 diffuse;

uniform bool useTexture;
uniform bool useBump;
uniform bool useSpecularMap;

uniform sampler2D textureSampler;
uniform sampler2D bumpSampler;
uniform sampler2D specularSampler;

uniform float bumpScale;

uniform vec3 keyLightPos;
uniform vec3 fillLightPos;
uniform vec3 backLightPos;

uniform vec3 keyLightColor;
uniform vec3 fillLightColor;
uniform vec3 backLightColor;

uniform bool keyLightOn;
uniform bool fillLightOn;
uniform bool backLightOn;

out vec4 outColor;

vec3 calcLight(vec3 lightPos, vec3 lightColor, vec3 norm) {
    vec3 lightDir = normalize(lightPos - fragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    return diff * lightColor;
}

vec3 perturbNormal(vec3 normal, vec2 texcoord) {
    float heightL = texture(bumpSampler, texcoord + vec2(-0.001, 0.0)).r;
    float heightR = texture(bumpSampler, texcoord + vec2( 0.001, 0.0)).r;
    float heightD = texture(bumpSampler, texcoord + vec2(0.0, -0.001)).r;
    float heightU = texture(bumpSampler, texcoord + vec2(0.0,  0.001)).r;

    vec3 dx = vec3(0.002, 0.0, (heightR - heightL) * bumpScale);
    vec3 dy = vec3(0.0, 0.002, (heightU - heightD) * bumpScale);
    vec3 perturbed = normalize(cross(dx, dy));
    return normalize(mix(normal, perturbed, 0.5));
}

void main() {
    vec3 norm = normalize(normalInterp);
    if (useBump) {
        norm = perturbNormal(norm, texcoordInterp);
    }

    vec4 texColor = useTexture ? texture(textureSampler, texcoordInterp) : vec4(1.0);
    vec3 baseColor = texColor.rgb * diffuse.rgb;
    float alpha = diffuse.a * texColor.a;

    vec3 color = vec3(0.0);
    if (keyLightOn) color += calcLight(keyLightPos, keyLightColor, norm);
    if (fillLightOn) color += calcLight(fillLightPos, fillLightColor, norm);
    if (backLightOn) color += calcLight(backLightPos, backLightColor, norm);

    vec3 specular = vec3(0.0);
    if (useSpecularMap) {
        vec3 viewDir = normalize(-fragPos);
        vec3 lightDir = normalize(keyLightPos - fragPos);
        vec3 reflectDir = reflect(-lightDir, norm);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
        float specIntensity = texture(specularSampler, texcoordInterp).r;
        specular += spec * specIntensity * keyLightColor;
    }

    vec3 finalColor = clamp(color * baseColor + specular, 0.0, 1.0);
    outColor = vec4(finalColor, alpha);
}

