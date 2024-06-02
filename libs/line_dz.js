// Объекты
function styleLinedz(feature) {
  let lengthLinedz = feature.properties.Length;
  let color;
  if (lengthLinedz == 10) {
    color = '#00db01';
  } else if (lengthLinedz > 10 && lengthLinedz <= 40) {
    color = '#ff8000';
  } else {
    color = '#ff4242';
  }
  return {
    color: color,
    weight: 7,
    opacity: 0.9
  };
}
// Добавление данных из GeoJSON-файла на карту
const linedzLayer = L.geoJSON(linedzMsk, {
  style: styleLinedz, // Применение стиля к линиям
  onEachFeature: function (feature, layer) {
    layer.bindPopup('<b>Название: </b><i>' + feature.properties.ObjectName + '</i>');
  }
});

//Кластеризация
// Функция для создания центральной точки линии
function getCenter(coords) {
  let latSum = 0, lngSum = 0, numPoints = 0;
  coords.forEach(line => {
    line.forEach(point => {
      lngSum += point[0];
      latSum += point[1];
      numPoints += 1;
    });
  });
  return [latSum / numPoints, lngSum / numPoints];
}
// Создание кластера для точек
const clusterLinedz = L.markerClusterGroup({
  maxClusterRadius: 60,
  disableClusteringAtZoom: 16,
  spiderLegPolylineOptions: {
    weight: 3,
    color: '#000000',
    opacity: 0.8
  },
  spiderfyOnMaxZoom: true,
  zoomToBoundsOnClick: false,
  showCoverageOnHover: true,
  removeOutsideVisibleBounds: true
});
// Обработчик события для клик на кластере
clusterLinedz.on('clusterclick', function (a) {
  a.layer.spiderfy();
});
// Определение цвета иконки на основе длины линии
function getIconColor(length) {
  if (length == 10) {
    return '#00db01'; // Зеленый цвет для длины 10 метров
  } else if (length > 10 && length <= 40) {
    return '#ff8000'; // Желтый цвет для длины больше 10м и до 40м включительно
  } else {
    return '#ff4242'; // Красный цвет для длины больше 40м
  }
}
// Добавление точек для кластеризации
linedzMsk.features.forEach(feature => {
  const center = getCenter(feature.geometry.coordinates);
  const length = feature.properties.Length;
  const color = getIconColor(length);

  const marker = L.marker(center, {
    title: feature.properties.ObjectName,
    icon: L.divIcon({
      html: `<div style="background-color: ${color}; border: 2px solid black; width: 10px; height: 10px; transform: rotate(45deg);"></div>`,
      className: 'custom-line-marker',
      iconSize: [10, 10]
    })
  });

  clusterLinedz.addLayer(marker);
});

//Легенда
var lgndLinedz = L.control({
  position: 'bottomright'
});
// Наполнение элемента интерфейса "Легенда"
lgndLinedz.onAdd = function (myMap) {
  let lgndDiv = L.DomUtil.create('div', 'LINESmapLgnd'),
    labels = [];
  L.DomEvent
    .disableScrollPropagation(lgndDiv)
    .disableClickPropagation(lgndDiv);
  labels.push('<center><b>Легенда для слоя с линиями</b></center><br>');
  //labels.push('');
  labels.push(`
  <div style="display: flex; align-items: center;">
    <div style="background-color: #00db01; width: 20px; height: 8px; margin-right: 5px;"></div>
    <span> - Линия длиной 10 метров</span>
  </div>
`);
  labels.push(`
  <div style="display: flex; align-items: center;">
    <div style="background-color: #ff8000; width: 20px; height: 8px; margin-right: 5px;"></div>
    <span> - Длина линии больше 10м и до 40м включительно</span>
  </div>
`);
  labels.push(`
  <div style="display: flex; align-items: center;">
    <div style="background-color: #ff4242; width: 20px; height: 8px; margin-right: 5px;"></div>
    <span> - Длина линии больше 40м</span>
  </div>
`);
  lgndDiv.innerHTML = labels.join('');
  return lgndDiv
};
// Реализация возможности отображения/скрытия легенды интерфейса "Легенда" при выборе слоя linedzLayer
function lgndAdd() {
  lgndLinedz.addTo(myMap);
};
function lgndRemove() {
  lgndLinedz.remove(myMap);
};
linedzLayer.on('add', lgndAdd);
linedzLayer.on('remove', lgndRemove);

// Тепловая карта (интенсивности)
// Принимает объект GeoJSON и преобразует его в формат тепловой карты
function convertGeoJSONToHeatmapData(geojson) {
  const heatmapData = [];
  // Проходит по всем объектам в GeoJSON, извлекает координаты для каждого объекта и добавляет их в массив heatmapData
  geojson.features.forEach(feature => {
    //const coordinates = feature.geometry.coordinates;
    const coordinates = getCenter(feature.geometry.coordinates);
    heatmapData.push({
      //lng: coordinates[0][0][0],
      //lat: coordinates[0][0][1],
      lng: coordinates[1],
      lat: coordinates[0],
      count: 4 // Вес
    })
  });
  return {
    max: 5,
    data: heatmapData
  };
}
// Преобразуем данные
const LINESheatmapData = convertGeoJSONToHeatmapData(linedzMsk);
//  Список настроек для создания поля тепловрй карты
const LINESheatmapCfg = {
  "radius": 50,
  "scaleRadius": false, //при false радиус в пикселях, иначе коэффициент
  "maxOpacity": 0.85,
  "useLocalExtrema": true,
  "latField": 'lat',
  "lngField": 'lng',
  "valueField": "count"
};
//  Создание слоя тепловой карты
const LINESheatmapLayer = new HeatmapOverlay(LINESheatmapCfg);
//  Наполняем слой тепловой карты данными
LINESheatmapLayer.setData(LINESheatmapData); // addData добавляется данные сразу