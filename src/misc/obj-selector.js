export function getObjectData (obj) {
    const data = {
        "grass": {
            obj: "../public/assets/Modelos3D/grass/grass.obj",
            mtl: "../public/assets/Modelos3D/grass/grass.mtl",
        },
        "suzanne": {
            obj: "../public/assets/Modelos3D/suzanne/suzanne.obj",
            mtl: "../public/assets/Modelos3D/suzanne/suzanne.mtl",
        },
        "boomerang": {
            obj: "../public/assets/Modelos3D/boomerang/boomerang.obj",
            mtl: "../public/assets/Modelos3D/boomerang/boomerang.mtl",
        },
        "ps1": {
            obj: "../public/assets/Modelos3D/ps1/ps1/MemoryCard.obj",
            mtl: "../public/assets/Modelos3D/ps1/ps1/MemoryCard.mtl",
        },
        "cube": {
            obj: "../public/assets/Modelos3D/cube/Cube.obj",
            mtl: "../public/assets/Modelos3D/cube/Cube.mtl",
        },
        "side-table": {
            obj: "../public/assets/Modelos3D/table/side-table/SideTable2.obj",
            mtl: "../public/assets/Modelos3D/table/side-table/SideTable2.mtl",
        },
        "barrel": {
            obj: "../public/assets/Modelos3D/barrel/barrel2.obj",
            mtl: "../public/assets/Modelos3D/barrel/barrel2.mtl",
        },
        "cart": {
            obj: "../public/assets/Modelos3D/cart/MinecraftCart/OBJ/MinecraftCart.obj",
            mtl: "../public/assets/Modelos3D/cart/MinecraftCart/OBJ/MinecraftCart.mtl",
        },
        "crade": {
            obj: "../public/assets/Modelos3D/crade/crades.obj",
            mtl: "../public/assets/Modelos3D/crade/crades.mtl",
        },
    }

    return data[obj] || {
        obj: null,
        mtl: null
    }

}
