export function getObjectData (obj) {
    const data = {
        "grass": {
            obj: "/assets/Modelos3D/grass/grass.obj",
            mtl: "/assets/Modelos3D/grass/grass.mtl",
        },
        "suzanne": {
            obj: "/assets/Modelos3D/suzanne/Suzanne.obj",
            mtl: "/assets/Modelos3D/suzanne/Suzanne.mtl",
        },
        "boomerang": {
            obj: "/assets/Modelos3D/boomerang/boomerang.obj",
            mtl: "/assets/Modelos3D/boomerang/boomerang.mtl",
        },
        "ps1": {
            obj: "/assets/Modelos3D/ps1/ps1/MemoryCard.obj",
            mtl: "/assets/Modelos3D/ps1/ps1/MemoryCard.mtl",
        },
        "cube": {
            obj: "/assets/Modelos3D/cube/Cube.obj",
            mtl: "/assets/Modelos3D/cube/Cube.mtl",
        },
        "side-table": {
            obj: "/assets/Modelos3D/table/side-table/SideTable2.obj",
            mtl: "/assets/Modelos3D/table/side-table/SideTable2.mtl",
        },
        "barrel": {
            obj: "/assets/Modelos3D/barrel/barrel2.obj",
            mtl: "/assets/Modelos3D/barrel/barrel2.mtl",
        },
        "cart": {
            obj: "/assets/Modelos3D/cart/MinecraftCart/OBJ/MinecraftCart.obj",
            mtl: "/assets/Modelos3D/cart/MinecraftCart/OBJ/MinecraftCart.mtl",
        },
        "crade": {
            obj: "/assets/Modelos3D/crade/crades.obj",
            mtl: "/assets/Modelos3D/crade/crades.mtl",
        },
    }

    return data[obj] || {
        obj: null,
        mtl: null
    }

}
