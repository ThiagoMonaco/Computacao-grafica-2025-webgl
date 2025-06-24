async function loadObjectsFromJSON(filePath) {
    try {
        const response = await fetch(filePath)
        if (!response.ok) {
            throw new Error(`Erro ao carregar arquivo: ${response.statusText}`)
        }

        const jsonData = await response.json()

        if (!Array.isArray(jsonData.objects)) {
            throw new Error("JSON inválido: atributo 'objects' deve ser um array")
        }

        const defaultValues = {
            interactionMode: null,
            initialPosition: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
            name: "suzanne",
            standByRotation: [0, 0, 0]
        }

        const objects = jsonData.objects.map(obj => ({
            interactionMode: obj.interactionMode ?? defaultValues.interactionMode,
            initialPosition: obj.initialPosition ?? defaultValues.initialPosition,
            rotation: obj.rotation ?? defaultValues.rotation,
            scale: obj.scale ?? defaultValues.scale,
            name: obj.name ?? defaultValues.name,
            standByRotation: obj.standByRotation ?? defaultValues.standByRotation,
        }))

        return objects
    } catch (error) {
        alert("Erro ao carregar ou processar o arquivo JSON: " + error.message)
        console.error("Erro ao processar JSON:", error)
        return []
    }
}

export { loadObjectsFromJSON }

