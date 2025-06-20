import { getKeys } from "../misc/keys"

let cameraState = {
    cameraPosition: [0, 0, 10],
    cameraRotation: {
        yaw: Math.PI,
        pitch: 0,
    },
    movementSpeed: 2.5,
    mouseSensitivity: 0.002,
    up: [0, 1, 0],
    zFar: 50,
    zNear: 0.1,
}


export function updateCameraState(attr, value) {
    cameraState[attr] = value
}

export function getCameraState() {
    return cameraState
}


export function updateCameraPosition(deltaTime) {
    const { cameraPosition, cameraRotation, movementSpeed} = cameraState
    const keysPressed = getKeys() 
    const forward = [
        Math.sin(cameraRotation.yaw),
        0,
        Math.cos(cameraRotation.yaw),
    ]

    const right = [
        Math.sin(cameraRotation.yaw - Math.PI/2),
        0,
        Math.cos(cameraRotation.yaw - Math.PI/2),
    ]

    if (keysPressed['w']) {
        cameraPosition[0] += forward[0] * movementSpeed * deltaTime
        cameraPosition[1] += forward[1] * movementSpeed * deltaTime
        cameraPosition[2] += forward[2] * movementSpeed * deltaTime
    }
    if (keysPressed['s']) {
        cameraPosition[0] -= forward[0] * movementSpeed * deltaTime
        cameraPosition[1] -= forward[1] * movementSpeed * deltaTime
        cameraPosition[2] -= forward[2] * movementSpeed * deltaTime
    }

    if (keysPressed['d']) {
        cameraPosition[0] += right[0] * movementSpeed * deltaTime
        cameraPosition[2] += right[2] * movementSpeed * deltaTime
    }
    if (keysPressed['a']) {
        cameraPosition[0] -= right[0] * movementSpeed * deltaTime
        cameraPosition[2] -= right[2] * movementSpeed * deltaTime
    }
}

export function startCamera () {
    const canvas = document.getElementById('canvas')
    const { cameraRotation, mouseSensitivity } = cameraState

    window.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
            cameraRotation.yaw -= e.movementX * mouseSensitivity
            cameraRotation.pitch -= e.movementY * mouseSensitivity
            cameraRotation.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.pitch))
        }
    })
}
