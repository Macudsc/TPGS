// Стилизация полигонов
function styleSquaredz(feature) {
  let heightSquaredz = feature.properties.height;
  let color;
  if (heightSquaredz < 15) {
    color = '#0bff00';
  } else if (heightSquaredz >= 15 && heightSquaredz < 40) {
    color = '#ffc42a';
  } else {
    color = '#ff1100';
  }
  return {
    color: '#8400ff',
    fillColor: color,
    weight: 3,
    opacity: 1,
    fillOpacity: 0.7
  };
}
// Добавление данных из GeoJSON-файла на карту
const squaredzLayer = L.geoJSON(squaredzMsk, {
  style: styleSquaredz, // Применение стиля к полигонам
  onEachFeature: function (feature, layer) {
    // Вычисление площади полигона
    const area = turf.area(feature); // Библиотека взяла свойства
    const areaInSqMeters = area.toFixed(2); // Площадь в квадратных метрах с 2 знаками после запятой
    const areaInHectares = (area / 10000).toFixed(2); // Площадь в гектарах с 2 знаками после запятой
    layer.bindPopup(`<b>Адрес: </b><i>${feature.properties.address}</i><br><b>Высота здания: </b><i>${feature.properties.height}</i><br><b>Площадь: </b><i>${areaInSqMeters} кв. м (${areaInHectares} га)</i><br><img src="data/shapes/square_dz/photos/${feature.properties.id}/photo.jpg" width=285px>`);
  }
});

//Легенда
var lgndSquaredz = L.control({
  position: 'bottomright'
});
// Наполнение элемента интерфейса "Легенда"
lgndSquaredz.onAdd = function (myMap) {
  let lgndDiv = L.DomUtil.create('div', 'SQUARESmapLgnd'),
    labels = [];
  L.DomEvent
    .disableScrollPropagation(lgndDiv)
    .disableClickPropagation(lgndDiv);
  labels.push('<center><b>Легенда для слоя с полигонами</b></center><br>');
  //labels.push('');
  labels.push(`
  <div style="display: flex; align-items: center;">
    <div style="background-color: #0bff00; width: 8px; height: 14px; margin-right: 5px;"></div>
    <span> - Высота здания меньше 15м</span>
  </div>
`);
  labels.push(`
  <div style="display: flex; align-items: center;">
    <div style="background-color: #ffc42a; width: 8px; height: 14px; margin-right: 5px;"></div>
    <span> - Высота здания больше и равна 15м и меньше 40м</span>
  </div>
`);
  labels.push(`
  <div style="display: flex; align-items: center;">
    <div style="background-color: #ff1100; width: 8px; height: 14px; margin-right: 5px;"></div>
    <span> - Высота здания больше или равна 40м</span>
  </div>
`);
  lgndDiv.innerHTML = labels.join('');
  return lgndDiv
};
// Реализация возможности отображения/скрытия легенды интерфейса "Легенда" при выборе слоя squaredzLayer
function lgndAdd() {
  lgndSquaredz.addTo(myMap);
};
function lgndRemove() {
  lgndSquaredz.remove(myMap);
};
squaredzLayer.on('add', lgndAdd);
squaredzLayer.on('remove', lgndRemove);

//Кластеризация
//* Функция для получения центральной точки полигона
function getCenter(coords) {
  let latSum = 0, lngSum = 0, numPoints = 0;
  coords[0][0].forEach(point => {
    lngSum += point[0];
    latSum += point[1];
    numPoints += 1;
  });
  return [latSum / numPoints, lngSum / numPoints];
}
// Определение пути к иконке на основе высоты здания
function getIconPath(height) {
  if (height < 15) {
    return 'data/icons/office-building_low.png'; // Путь к зеленой иконке для высоты меньше 15м
  } else if (height >= 15 && height < 40) {
    return 'data/icons/office-building_mid.png'; // Путь к желтой иконке для высоты от 15м до 40м включительно
  } else {
    return 'data/icons/office-building_big.png'; // Путь к красной иконке для высоты больше 40м
  }
}
//Создание кластера для полигонов
const clusterSquaredz = L.markerClusterGroup({
  maxClusterRadius: 50,
  disableClusteringAtZoom: 20,
  spiderLegPolylineOptions: {
    weight: 3,
    color: '#39241D',
    opacity: 0.8
  },
  spiderfyOnMaxZoom: true,
  zoomToBoundsOnClick: false,
  showCoverageOnHover: true,
  removeOutsideVisibleBounds: true
});
// Обработчик события для клика на кластер
clusterSquaredz.on('clusterclick', function (a) {
  a.layer.spiderfy();
});
// Добавление центральных точек полигонов в кластерную группу
squaredzMsk.features.forEach(feature => {
  const center = getCenter(feature.geometry.coordinates);
  const height = feature.properties.height;
  const iconPath = getIconPath(height);
  const marker = L.marker(center, {
    title: feature.properties.address,
    icon: L.divIcon({
      html: `<img src="${iconPath}" style="width: 30px; height: 30px;">`,
      className: 'custom-line-marker',
      //iconSize: [30, 30]
      iconAnchor: [15, 15],
    })
  });
  clusterSquaredz.addLayer(marker);
});

// Тепловая карта (интенсивности)
// Принимает объект GeoJSON и преобразует его в формат тепловой карты
function convertGeoJSONToHeatmapData(geojson) {
  const heatmapData = [];
  // Проходит по всем объектам в GeoJSON, извлекает координаты для каждого объекта и добавляет их в массив heatmapData
  geojson.features.forEach(feature => {
    //const coordinates = feature.geometry.coordinates;
    const coordinates = getCenter(feature.geometry.coordinates);
    heatmapData.push({
      //lng: coordinates[0][0][0][0],
      //lat: coordinates[0][0][0][1],
      lng: coordinates[1],
      lat: coordinates[0],
      count: 5 // Вес
    })
  });
  return {
    max: 8,
    data: heatmapData
  };
}
// Преобразуем данные
const SQUARESheatmapData = convertGeoJSONToHeatmapData(squaredzMsk);
//  Список настроек для создания поля тепловой карты
const SQUARESheatmapCfg = {
  "radius": 55,
  "scaleRadius": false, //при false радиус в пикселях, иначе коэффициент
  "maxOpacity": 0.9,
  "useLocalExtrema": true,
  "latField": 'lat',
  "lngField": 'lng',
  "valueField": "count"
};
//  Создание слоя тепловой карты
const SQUARESheatmapLayer = new HeatmapOverlay(SQUARESheatmapCfg);
//  Наполняем слой тепловой карты данными
SQUARESheatmapLayer.setData(SQUARESheatmapData);


//===============================
//?/*
////Линейный объект или полигон
////Создание линейного объекта
//L.polygon([[55.757344, 37.660779],
////L.polygon([[55.757344, 37.660779],
//[55.776748, 37.657313],
//[55.773550, 37.656401], [55.757344, 37.660779]
//], {
//  color: 'green',
//  fillColor: 'red',
//  fillOpacity: 0.8,
//  //fillRule: 'nonzero',
//  opacity: 1,
//  weight: 2,
//  lineCap: 'round',
//  lineJoin: 'round',
//  stroke: true,
//  //dashOffset: 3,
//  dashArray: "10 7"
//}).addTo(myMap);
//*/
