// ================================================
// INICIALIZACIÓN DEL MAPA
// ================================================
const map = L.map('map');

const CENTRO_CIUDAD = [-3.0, 40.0];
const GRADOS_ROTACION = -55;

function rotarGeoJSON(geojson, grados, centro) {
  const rad = (grados * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const [cx, cy] = centro;

  function rotarPunto([lng, lat]) {
    const dx = lng - cx;
    const dy = lat - cy;
    return [
      cx + dx * cos - dy * sin,
      cy + dx * sin + dy * cos
    ];
  }

  function rotarCoordenadas(coords) {
    if (typeof coords[0] === 'number') return rotarPunto(coords);
    return coords.map(rotarCoordenadas);
  }

  return {
    ...geojson,
    features: geojson.features.map(f => ({
      ...f,
      geometry: {
        ...f.geometry,
        coordinates: rotarCoordenadas(f.geometry.coordinates)
      }
    }))
  };
}
// ================================================
// ÁREA APROXIMADA DE UN POLÍGONO (para ordenar capas)
// ================================================
function areaAproximada(feature) {
  try {
    const coords = feature.geometry.coordinates[0];
    if (!coords || coords.length === 0) return 0;

    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    const w = Math.max(...lngs) - Math.min(...lngs);
    const h = Math.max(...lats) - Math.min(...lats);
    return w * h;
  } catch {
    return 0;
  }
}
// ================================================
// COLORES POR NIVEL DE TERRENO
// Ajusta los hex con los valores exactos de QGIS
// ================================================
function colorPorNivel(nivel) {
  if (nivel <= 101) return '#7dc47d';   // verde
  if (nivel <= 201) return '#c8b84a';   // amarillo/arena
  if (nivel <= 301) return '#8b6a3a';   // marrón oscuro
  if (nivel <= 401) return '#a8c4d4';   // azul grisáceo
  if (nivel <= 501) return '#c8c8c8';   // gris claro
}

// ================================================
// ESTILOS POR TIPO DE CARRETERA
// Ajusta colores y grosores según tus símbolos de QGIS
// ================================================
function estiloCarretera(feature) {
  const tipo = feature.properties.tipo;

  const estilos = {
    'superior_principal': { color: '#cc2200', weight: 5,   opacity: 1   },
    'principal':          { color: '#dd3300', weight: 3.5, opacity: 1   },
    'inferior/principal': { color: '#e05500', weight: 2.5, opacity: 1   },
    'via':                { color: '#e07020', weight: 2,   opacity: 1 },
    'inferior':           { color: '#aaaaaa', weight: 1.2, opacity: 1}
  };

  // ELSE: estilo por defecto para tipos no reconocidos
  return estilos[tipo] ?? { color: '#707070', weight: 1, opacity: 1 };
}

// ================================================
// GROSOR ADAPTATIVO AL ZOOM
// ================================================
function estiloCarreteraConZoom(feature) {
  const zoom = map.getZoom();
  let factor;
  if      (zoom >= 14) factor = 1.0;
  else if (zoom >= 12) factor = 0.6;
  else if (zoom >= 10) factor = 0.35;
  else                 factor = 0.15;

  const estilo = estiloCarretera(feature);
  return { ...estilo, weight: estilo.weight * factor };
}

// ================================================
// CARGA DE LA CAPA UNIONES (carreteras)
// ================================================
function cargarUniones() {
  fetch('data/uniones.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar uniones.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}
// ================================================
// CARGA DE LA CAPA FESTIVAL
// ================================================
function cargarFestival() {
  fetch('data/festival.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar festival.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA AEROPUERTO
// ================================================
function cargarAeropuerto() {
  fetch('data/aeropuerto.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar aeropuerto.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA AREA INDUSTRIAL
// ================================================
function cargarAreaIndustrial() {
  fetch('data/area_industrial.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar area_industrial.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA AUTOVIA 2 CARRILES
// ================================================
function cargarAutovia2Carriles() {
  fetch('data/autovia_2_carriles.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar autovia_2_carriles.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA AUTOVIA 3 CARRILES 
// ================================================
function cargarAutovia3Carriles() {
  fetch('data/autovia_3_carriles.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar autovia_3_carriles.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA BAHIA VIZKAIA GAS
// ================================================
function cargarBahiaVizkaiaGas() {
  fetch('data/bahia_vizkaia_gas.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar bahia_vizkaia_gas.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA CAMPING
// ================================================
function cargarCamping() {
  fetch('data/camping.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar camping.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA CENTRO CIUDAD 
// ================================================
function cargarCentroCiudad() {
  fetch('data/centro_ciudad.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar centro_ciudad.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA CENTRO CIUDAD 2
// ================================================
function cargarCentroCiudad2() {
  fetch('data/centro_ciudad2.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar centro_ciudad2.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA CENTRO COMERCIAL
// ================================================
function cargarCentroComercial() {
  fetch('data/centro_comercial.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar centro_comercial.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA COASTLINE
// ================================================
function cargarCoastline() {
  fetch('data/coastline.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar coastline.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA EDIFICIO ALTO
// ================================================
function cargarEdificioAlto() {
  fetch('data/edificio_alto.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar edificio_alto.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA ESTACION DE TREN 
// ================================================
function cargarEstacionTren() {
  fetch('data/estacion_tren.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar estacion_tren.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA INDUSTRIA
// ================================================
function cargarIndustria() {
  fetch('data/industria.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar industria.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA PLANTA PETRO
// ================================================
function cargarPlantaPetro() {
  fetch('data/planta_petro.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar planta_petro.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA PORT EVERGLADES 
// ================================================
function cargarPortEverglades() {
  fetch('data/port_everglades.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar port_everglades.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA PUNTA SAN GARCIA
// ================================================
function cargarPuntaSanGarcia() {
  fetch('data/punta_san_garcia.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar punta_san_garcia.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA REFINERIA
// ================================================
function cargarRefineria() {
  fetch('data/refineria.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar refineria.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA TUNEL ACCESO
// ================================================
function cargarTunelAcceso() {
  fetch('data/tunel_acceso.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar tunel_acceso.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA URBAS
// ================================================
function cargarUrba() {
  fetch('data/urba.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar urba.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// CARGA DE LA CAPA ZONA RESIDENCIAL
// ================================================
function cargarZonaResidencial() {
  fetch('data/zona_residencial.geojson')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar zona_residencial.geojson');
      return res.json();
    })
    .then(data => {
      const dataRotada = rotarGeoJSON(data, GRADOS_ROTACION, CENTRO_CIUDAD);

      const capa = L.geoJSON(dataRotada, {
        style: feature => estiloCarreteraConZoom(feature),
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          if (props && Object.keys(props).length > 0) {
            const contenido = Object.entries(props)
              .filter(([k, v]) => v !== null && v !== '')
              .map(([k, v]) => `<b>${k}:</b> ${v}`)
              .join('<br>');
            layer.bindPopup(contenido);
          }
        }
      }).addTo(map);

      map.on('zoomend', () => {
        capa.setStyle(feature => estiloCarreteraConZoom(feature));
      });
    })
    .catch(err => console.warn(err.message));
}

// ================================================
// ICONOS DE EMERGENCIA
// ================================================
function crearIconoEmoji(emoji) {
  return L.divIcon({
    html:        `<span style="font-size:28px;line-height:1;">${emoji}</span>`,
    className:   '',
    iconSize:    [32, 32],
    iconAnchor:  [16, 32],
    popupAnchor: [0, -32]
  });
}

const iconos = {
  fuego:      crearIconoEmoji('🔥'),
  alerta:     crearIconoEmoji('⚠️'),
  inundacion: crearIconoEmoji('🌊'),
  explosion:  crearIconoEmoji('💥'),
  medico:     crearIconoEmoji('🏥')
};

// ================================================
// CARGA DE EMERGENCIAS DESDE EL SERVIDOR
// ================================================
let capaMarcadores = L.layerGroup().addTo(map);

function cargarEmergencias() {
  fetch('/api/emergencias')
    .then(res => res.json())
    .then(emergencias => {
      capaMarcadores.clearLayers(); // limpia los anteriores

      emergencias.forEach(e => {
        const icono = iconos[e.tipo] || crearIconoEmoji('📍');
        L.marker([e.lat, e.lng], { icon: icono })
          .bindPopup(`<b>${e.tipo.toUpperCase()}</b><br>${e.descripcion}`)
          .addTo(capaMarcadores);
      });
    });
}

// Carga inicial y refresco cada 10 segundos
cargarEmergencias();
setInterval(cargarEmergencias, 10000);

// ================================================
// CARGAR CAPAS BASE (igual que antes)
// ================================================
fetch('/data/delimitaciones.geojson')
  .then(res => res.json())
  .then(data => {
    const featuresOrdenados = [...data.features].sort(
      (a, b) => areaAproximada(b) - areaAproximada(a)
    );
    const dataRotada = rotarGeoJSON(
      { ...data, features: featuresOrdenados },
      GRADOS_ROTACION,
      CENTRO_CIUDAD
    );
    const capa = L.geoJSON(dataRotada, {
      style: feature => {
        const nivel = feature.properties.nivel_terreno;
        const sinValor = nivel === null || nivel === undefined;
        return {
          fillColor:   colorPorNivel(nivel),
          fillOpacity: sinValor ? 0 : 1,
          color:       sinValor ? 'transparent' : '#555',
          weight:      sinValor ? 0 : 0.8
        };
      }
    });
    capa.addTo(map);
    map.fitBounds(capa.getBounds());
    cargarUniones();
    cargarEstacionTren();
    cargarEdificioAlto();
    cargarCentroCiudad();
    cargarCentroCiudad2();
    cargarCentroComercial();
    cargarBahiaVizkaiaGas();
    cargarAeropuerto();
    cargarAreaIndustrial();
    cargarAutovia2Carriles();
    cargarAutovia3Carriles();
    cargarCamping();
    cargarCoastline();
    cargarIndustria();
    cargarPlantaPetro();
    cargarPortEverglades();
    cargarPuntaSanGarcia();
    cargarRefineria();
    cargarTunelAcceso();
    cargarUrba();
    cargarZonaResidencial();
    cargarFestival();
  });
