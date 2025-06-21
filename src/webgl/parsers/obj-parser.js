export function parseOBJ(text) {
    const objPositions = [[0, 0, 0]]
    const objTexcoords = [[0, 0]]
    const objNormals = [[0, 0, 0]]
    const objVertexData = [objPositions, objTexcoords, objNormals]
    const webglVertexData = [[], [], []]

    let currentMaterial = 'default'
    let currentObject = 'default'
    let currentGroup = 'default'
    let currentSmoothing = 'off'

    const materialsLibs = []
    const materialGroups = {}
    const objectGroups = {}
    const groupGroups = {}
    const smoothingGroups = {}

    function addToGroup(groupMap, key, baseIndex) {
        if (!groupMap[key]) groupMap[key] = []
        groupMap[key].push(baseIndex, baseIndex + 1, baseIndex + 2)
    }

    function addVertex(vert) {
        const ptn = vert.split('/')
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) return
            const objIndex = parseInt(objIndexStr)
            const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length)
            webglVertexData[i].push(...objVertexData[i][index])
        })
    }

    const lines = text.split('\n')
    const keywordRE = /(\w*)(?: )*(.*)/

    const keywords = {
        v(parts) { objPositions.push(parts.map(parseFloat)) },
        vn(parts) { objNormals.push(parts.map(parseFloat)) },
        vt(parts) { objTexcoords.push(parts.map(parseFloat)) },
        usemtl(parts) { currentMaterial = parts[0] },
        mtllib(parts) { materialsLibs.push(parts[0]) },
        o(parts) { currentObject = parts[0] || 'unnamed' },
        g(parts) { currentGroup = parts[0] || 'unnamed' },
        s(parts) { currentSmoothing = parts[0] || 'off' },
        f(parts) {
            const n = parts.length - 2
            for (let i = 0; i < n; ++i) {
                const verts = [parts[0], parts[i + 1], parts[i + 2]]
                verts.forEach(addVertex)

                const baseIndex = webglVertexData[0].length / 3 - 3

                addToGroup(materialGroups, currentMaterial, baseIndex)
                addToGroup(objectGroups, currentObject, baseIndex)
                addToGroup(groupGroups, currentGroup, baseIndex)
                addToGroup(smoothingGroups, currentSmoothing, baseIndex)

                if (objNormals.length <= 1) {
                    const getPos = idx =>
                        webglVertexData[0].slice(idx * 3, idx * 3 + 3)

                    const p0 = getPos(baseIndex)
                    const p1 = getPos(baseIndex + 1)
                    const p2 = getPos(baseIndex + 2)

                    const u = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]
                    const v = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]]

                    const nx = u[1] * v[2] - u[2] * v[1]
                    const ny = u[2] * v[0] - u[0] * v[2]
                    const nz = u[0] * v[1] - u[1] * v[0]

                    const length = Math.hypot(nx, ny, nz) || 1
                    const normal = [nx / length, ny / length, nz / length]
                    webglVertexData[2].push(...normal, ...normal, ...normal)
                }
            }
        },
    }

    for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed === '' || trimmed.startsWith('#')) continue
        const m = keywordRE.exec(trimmed)
        if (!m) continue
        const [, keyword] = m
        const parts = trimmed.split(/\s+/).slice(1)
        const handler = keywords[keyword]
        if (!handler) {
            console.warn('unhandled keyword:', keyword)
            continue
        }
        handler(parts)
    }

    return {
        position: webglVertexData[0],
        texcoord: webglVertexData[1],
        normal: webglVertexData[2],
        materialsLibs,
        materialGroups,
        objectGroups,
        groupGroups,
        smoothingGroups,
    }
}

