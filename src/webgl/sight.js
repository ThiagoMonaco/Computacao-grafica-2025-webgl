let sightState = {} 

function setSightMessage(id, newMessage, objectInSight = false) {
    sightState[id] = {
        message: newMessage,
        objectInSight: objectInSight
    }
    const promptEl = document.getElementById("interactionPrompt")
    if (hasSomeObjectInSight()) {
        promptEl.style.display = 'block'
        promptEl.innerHTML = newMessage 
    } else {
        promptEl.style.display = 'none'
    }
}

function hasSomeObjectInSight() {
    return Object.values(sightState).some(state => state.objectInSight);
}

export {
    setSightMessage,
    sightState, 
}
