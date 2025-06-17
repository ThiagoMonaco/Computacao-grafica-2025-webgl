export function parseOBJ(text) {
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];
  const objVertexData = [objPositions, objTexcoords, objNormals];
  const webglVertexData = [[], [], []];
    let currentMaterial = 'default';
const materialsLibs = [];
const materialGroups = {};

  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) return;
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }

  const lines = text.split('\n');
  const keywordRE = /(\w*)(?: )*(.*)/;
  const keywords = {
    v(parts) { objPositions.push(parts.map(parseFloat)); },
    vn(parts) { objNormals.push(parts.map(parseFloat)); },
    vt(parts) { objTexcoords.push(parts.map(parseFloat)); },
    f(parts) {
      const n = parts.length - 2;
      for (let i = 0; i < n; ++i) {
        addVertex(parts[0]);
        addVertex(parts[i + 1]);
        addVertex(parts[i + 2]);
      }
    },
  mtllib(parts) {
    materialsLibs.push(parts[0]); // Ex: ['cube.mtl']
  },
      usemtl(parts) {
          currentMaterial = parts[0];
      },
      f(parts) {
          const numTriangles = parts.length - 2;
          for (let tri = 0; tri < numTriangles; ++tri) {
              addVertex(parts[0]);
              addVertex(parts[tri + 1]);
              addVertex(parts[tri + 2]);

              if (!materialGroups[currentMaterial]) {
                  materialGroups[currentMaterial] = [];
              }
              materialGroups[currentMaterial].push(webglVertexData[0].length / 3 - 3);
              materialGroups[currentMaterial].push(webglVertexData[0].length / 3 - 2);
              materialGroups[currentMaterial].push(webglVertexData[0].length / 3 - 1);
          }
      },
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;
    const m = keywordRE.exec(trimmed);
    if (!m) continue;
    const [, keyword] = m;
    const parts = trimmed.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      console.warn('unhandled keyword:', keyword);
      continue;
    }
    handler(parts);
  }

  return {
    position: webglVertexData[0],
    texcoord: webglVertexData[1],
    normal: webglVertexData[2],
        materialGroups,
  materialsLibs,
  };
}

