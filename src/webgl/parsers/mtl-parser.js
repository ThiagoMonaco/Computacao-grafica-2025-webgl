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
                if (currentMaterial) currentMaterial.diffuse = args.map(Number)
                break
            case 'Ka':
                if (currentMaterial) currentMaterial.ambient = args.map(Number)
                break
            case 'Ks':
                if (currentMaterial) currentMaterial.specular = args.map(Number)
                break
            case 'Tf':
                if (currentMaterial) currentMaterial.transmissionFilter = args.map(Number)
                break
            case 'illum':
                if (currentMaterial) currentMaterial.illum = parseInt(args[0])
                break
            case 'Ni':
                if (currentMaterial) currentMaterial.opticalDensity = parseFloat(args[0])
                break
            case 'Ns':
                if (currentMaterial) currentMaterial.shininess = parseFloat(args[0])
                break
            case 'map_Kd':
                if (currentMaterial) currentMaterial.map_Kd = args.join(' ')
                break
            case 'map_Ks':
                if (currentMaterial) currentMaterial.map_Ks = args.join(' ')
                break
            case 'bump':
            case 'map_bump':
                if (currentMaterial) {
                    let filename = args[args.length - 1]
                    let bumpScale = 0.2
                    const bmIndex = args.indexOf('-bm')
                    if (bmIndex !== -1 && args.length > bmIndex + 1) {
                        bumpScale = parseFloat(args[bmIndex + 1])
                    }
                    currentMaterial.map_Bump = filename
                    currentMaterial.bumpScale = bumpScale
                }
                break
            default:
                break
        }
    }

    return materials
}

