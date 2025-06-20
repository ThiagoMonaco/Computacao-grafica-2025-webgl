import { getKeys } from "../misc/keys";

let lights = {
    keyLight: {
        position: [5, 10, 5],
        color: [1.0, 0.95, 0.8],
        on: true
    },
    fillLight: {
        position: [-5, 5, 5],
        color: [0.4, 0.4, 0.5],
        on: true
    },
    backLight: {
        position: [0, 5, -5],
        color: [0.3, 0.3, 0.4],
        on: true
    }
};

function startLights() {
    window.addEventListener('keydown', (e) => {
        const keysPressed = getKeys()
        keysPressed[e.key.toLowerCase()] = true;

        if (e.key === '1') lights.keyLight.on = !lights.keyLight.on;
        if (e.key === '2') lights.fillLight.on = !lights.fillLight.on;
        if (e.key === '3') lights.backLight.on = !lights.backLight.on;
    });
}

function getLights() {
    return lights
}

export { startLights, getLights }
