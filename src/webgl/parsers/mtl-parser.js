export function parseMTL(text) {
    const materials = {}
    let currentMaterial = null

    const lines = text.split('\n')
    for (let line of lines) {
        line = line.trim()
        if (line === '' || line.startsWith('#')) continue

        const [keyword, ...args] = line.split(/\s+/)

        switch (keyword) {
            case 'newmtl':
                currentMaterial = {}
                materials[args[0]] = currentMaterial
                break
            case 'Kd':
                currentMaterial.diffuse = args.map(Number)
                break
            case 'Ka':
                currentMaterial.ambient = args.map(Number)
                break
            case 'Ks':
                currentMaterial.specular = args.map(Number)
                break
            case 'Ns':
                currentMaterial.shininess = parseFloat(args[0])
                break
            case 'map_Kd':
                currentMaterial.map_Kd = args[0]
                break
        }
    }

    return materials
}

