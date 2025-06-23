function getTriangles (materialGroups, position) {
    const triangles = []
    for (const indices of Object.values(materialGroups)) {
        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i]
            const i1 = indices[i + 1]
            const i2 = indices[i + 2]

            const v0 = [position[i0 * 3 + 0], position[i0 * 3 + 1], position[i0 * 3 + 2]]
            const v1 = [position[i1 * 3 + 0], position[i1 * 3 + 1], position[i1 * 3 + 2]]
            const v2 = [position[i2 * 3 + 0], position[i2 * 3 + 1], position[i2 * 3 + 2]]

            if (v0.every(n => n !== undefined) && v1.every(n => n !== undefined) && v2.every(n => n !== undefined)) {
                triangles.push([v0, v1, v2])
            }
        }
    }
    return triangles
}

export { getTriangles }
