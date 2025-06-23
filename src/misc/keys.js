const keysPressed = {}


function startKeys() {
    window.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
        keysPressed[e.key.toLowerCase()] = false;
    });
}

function getKeys() {
    return keysPressed
}


export { getKeys, startKeys }

