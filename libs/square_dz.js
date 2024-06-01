// Объекты
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
    layer.bindPopup('<b>Адрес: </b><i>' + feature.properties.address + '</i><br><b>Высота здания: </b><i>' + feature.properties.height);
  }
});

////Кластеризация
//// Функция для создания центральной точки линии
//function getCenter(coords) {
//  let latSum = 0, lngSum = 0, numPoints = 0;
//  coords.forEach(line => {
//    line.forEach(point => {
//      lngSum += point[0];
//      latSum += point[1];
//      numPoints += 1;
//    });
//  });
//  return [latSum / numPoints, lngSum / numPoints];
//}
//// Создание кластера для точек
//const clusterLinedz = L.markerClusterGroup({
//  maxClusterRadius: 60,
//  disableClusteringAtZoom: 16,
//  spiderLegPolylineOptions: {
//    weight: 3,
//    color: '#000000',
//    opacity: 0.8
//  },
//  spiderfyOnMaxZoom: true,
//  zoomToBoundsOnClick: true,
//  showCoverageOnHover: true,
//  removeOutsideVisibleBounds: true
//});
//// Определение цвета иконки на основе длины линии
//function getIconColor(length) {
//  if (length == 10) {
//    return '#00db01'; // Зеленый цвет для длины 10 метров
//  } else if (length > 10 && length <= 40) {
//    return '#ff8000'; // Желтый цвет для длины больше 10м и до 40м включительно
//  } else {
//    return '#ff4242'; // Красный цвет для длины больше 40м
//  }
//}
//// Добавление точек для кластеризации
//squaredzMsk.features.forEach(feature => {
//  const center = getCenter(feature.geometry.coordinates);
//  const length = feature.properties.Length;
//  const color = getIconColor(length);

//  const marker = L.marker(center, {
//    title: feature.properties.ObjectName,
//    icon: L.divIcon({
//      html: `<div style="background-color: ${color}; border: 2px solid black; width: 10px; height: 10px; transform: rotate(45deg);"></div>`,
//      className: 'custom-line-marker',
//      iconSize: [10, 10]
//    })
//  });

//  clusterLinedz.addLayer(marker);
//});

////Легенда
//var lgndLinedz = L.control({
//  position: 'bottomright'
//});
//// Наполнение элемента интерфейса "Легенда"
//lgndLinedz.onAdd = function (myMap) {
//  let lgndDiv = L.DomUtil.create('div', 'LINESmapLgnd'),
//    labels = [];
//  L.DomEvent
//    .disableScrollPropagation(lgndDiv)
//    .disableClickPropagation(lgndDiv);
//  labels.push('<center><b>Легенда для слоя с линиями</b></center><br>');
//  //labels.push('');
//  labels.push(`
//  <div style="display: flex; align-items: center;">
//    <div style="background-color: #00db01; width: 20px; height: 8px; margin-right: 5px;"></div>
//    <span> - Линия длиной 10 метров</span>
//  </div>
//`);
//  labels.push(`
//  <div style="display: flex; align-items: center;">
//    <div style="background-color: #ff8000; width: 20px; height: 8px; margin-right: 5px;"></div>
//    <span> - Длина линии больше 10м и до 40м включительно</span>
//  </div>
//`);
//  labels.push(`
//  <div style="display: flex; align-items: center;">
//    <div style="background-color: #ff4242; width: 20px; height: 8px; margin-right: 5px;"></div>
//    <span> - Длина линии больше 40м</span>
//  </div>
//`);
//  lgndDiv.innerHTML = labels.join('');
//  return lgndDiv
//};
//// Реализация возможности отображения/скрытия легенды интерфейса "Легенда" при выборе слоя squaredzLayer
//function lgndAdd() {
//  lgndLinedz.addTo(myMap);
//};
//function lgndRemove() {
//  lgndLinedz.remove(myMap);
//};
//squaredzLayer.on('add', lgndAdd);
//squaredzLayer.on('remove', lgndRemove);

//// Тепловая карта (интенсивности)
//// Принимает объект GeoJSON и преобразует его в формат тепловой карты
//function convertGeoJSONToHeatmapData(geojson) {
//  const heatmapData = [];
//  // Проходит по всем объектам в GeoJSON, извлекает координаты для каждого объекта и добавляет их в массив heatmapData
//  geojson.features.forEach(feature => {
//    const coordinates = feature.geometry.coordinates;
//    heatmapData.push({
//      lng: coordinates[0][0][0],
//      lat: coordinates[0][0][1],
//      count: 5 // Вес
//    })
//  });
//  return {
//    max: 5,
//    data: heatmapData
//  };
//}
//// Преобразуем данные
//const LINESheatmapData = convertGeoJSONToHeatmapData(squaredzMsk);
////  Список настроек для создания поля тепловрй карты
//const LINESheatmapCfg = {
//  "radius": 50,
//  "scaleRadius": false, //при false радиус в пикселях, иначе коэффициент
//  "maxOpacity": 0.9,
//  "useLocalExtrema": true,
//  "latField": 'lat',
//  "lngField": 'lng',
//  "valueField": "count"
//};
////  Создание слоя тепловой карты
//const LINESheatmapLayer = new HeatmapOverlay(LINESheatmapCfg);
////  Наполняем слой тепловой карты данными
//LINESheatmapLayer.setData(LINESheatmapData); // addData добавляется данные сразу



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
