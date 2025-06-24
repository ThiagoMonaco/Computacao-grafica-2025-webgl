let sightState = {} 

function setSightMessage(id, newMessage, objectInSight = false) {
    sightState[id] = {
        message: newMessage ? newMessage : sightState[id]?.message,
        objectInSight: objectInSight
    }
    const promptEl = document.getElementById("interactionPrompt")
    const message = getFirstObjectInSightMessage();
    if (message) {
        promptEl.style.display = 'block'
        promptEl.innerHTML = message 
    } else {
        promptEl.style.display = 'none'
    }
}

function getFirstObjectInSightMessage() {
    for (const [id, state] of Object.entries(sightState)) {
        if (state.objectInSight) {
            return state.message;
        }
    }
    return null;
}

export {
    setSightMessage,
    sightState, 
}
