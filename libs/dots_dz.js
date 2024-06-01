//Иконки и точечные объекты
var dotIcn = L.Icon.extend({
  options: {
    iconSize: [15, 15],
    iconAnchor: [8, 8],
    popupAnchor: [0, -23]
  }
});
// Формирование массива иконок на основе собственного класса dotIcn
var dotsdzIcns = [
  new dotIcn({ iconUrl: 'data/icons/record-button_low.png' }),
  new dotIcn({ iconUrl: 'data/icons/record-button_mid.png' }),
  new dotIcn({ iconUrl: 'data/icons/record-button_big.png' })
];
// Добавление данных из GeoJSON-файла на карту
const dotsdzLayer = L.geoJSON(dotsdzMsk, {
  pointToLayer: function (feature, latlng) {
    let nameDotsdz = feature.properties.ObjectName;
    nameDotsdz.includes('Truck') ? icn = dotsdzIcns[2] :
      nameDotsdz.includes('Car') ? icn = dotsdzIcns[1] :
        icn = dotsdzIcns[0];
    return L.marker(latlng, {
      title: feature.properties.ObjectName,
      icon: icn
    })
  },
})
  .bindPopup(function (dotsdzMsk) {
    let dotsdzPhoto = '';
    if (dotsdzMsk.feature.properties.id == 1) { //Как в Groovy
      dotsdzPhoto = '</i><br><img src="data/shapes/dots_dz/photos/XXXL.webp" width=285px height=214px>'
    };
    return '<b>Название: </b><i>' + dotsdzMsk.feature.properties.ObjectName + dotsdzPhoto;
  });

//Кластеризация
const clusterDotsdz = L.markerClusterGroup({
  maxClusterRadius: 35,
  disableClusteringAtZoom: 16, // оптимально 16
  spiderLegPolylineOptions: {
    weight: 3,
    color: 'blue',
    opacity: 0.8
  },
  spiderflyOnMaxZoom: false, //запрет на распадание на составные части
  zoomToBoundsOnClick: true, //Увеличить масштаб, щелкнув по кнопке
  showCoverageOnHover: true, //показывать Площадь покрытия При Наведении Курсора
  removeOutsideVisibleBounds: true //убрать невидимые за экраном объекты
});
//  Добавление в сущность объектов из слоя точек
clusterDotsdz.addLayer(dotsdzLayer);

//Легенда
var lgndDotsdz = L.control({
  position: 'bottomright'
});
// Наполнение элемента интерфейса "Легенда"
lgndDotsdz.onAdd = function (myMap) {
  let lgndDiv = L.DomUtil.create('div', 'DOTSmapLgnd'),
    labels = [];
  L.DomEvent
    .disableScrollPropagation(lgndDiv)
    .disableClickPropagation(lgndDiv);
  labels.push('<center><b>Легенда для слоя с точками</b></center>');
  //labels.push('');
  labels.push('<img src="data/icons/record-button_big.png" height="10" width="10"> - Грузовики');
  labels.push('<img src="data/icons/record-button_mid.png" height="10" width="10"> - Машины');
  labels.push('<img src="data/icons/record-button_low.png" height="10" width="10"> - Остальное');
  lgndDiv.innerHTML = labels.join('<br>');
  return lgndDiv
};
// Реализация возможности отображения/скрытия легенды интерфейса "Легенда" при выборе слоя dotsdzLayer
function lgndAdd() {
  lgndDotsdz.addTo(myMap);
};
function lgndRemove() {
  lgndDotsdz.remove(myMap);
};
dotsdzLayer.on('add', lgndAdd);
dotsdzLayer.on('remove', lgndRemove);

// Тепловая карта (интенсивности)
// ! Важное отличие от исходной программы курса. Автоматизация ввода координат
// Функция для преобразования данных GeoJSON в формат тепловой карты
// Принимает объект GeoJSON и преобразует его в формат тепловой карты
function convertGeoJSONToHeatmapData(geojson) {
  const heatmapData = [];
  // Проходит по всем объектам в GeoJSON, извлекает координаты для каждого объекта и добавляет их в массив heatmapData
  geojson.features.forEach(feature => {
    const coordinates = feature.geometry.coordinates;
    heatmapData.push({
      lng: coordinates[0],
      lat: coordinates[1],
      count: 1 // Вес
    })
  });
  return {
    max: 5,
    data: heatmapData
  };
}
// Преобразуем данные
const DOTSheatmapData = convertGeoJSONToHeatmapData(dotsdzMsk);
//  Список настроек для создания поля тепловрй карты
const DOTSheatmapCfg = {
  "radius": 30,
  "scaleRadius": false, //при false радиус в пикселях, иначе коэффициент
  "maxOpacity": 0.8,
  "useLocalExtrema": true,
  "latField": 'lat',
  "lngField": 'lng',
  "valueField": "count"
};
//  Создание слоя тепловой карты
const DOTSheatmapLayer = new HeatmapOverlay(DOTSheatmapCfg);
//  Наполняем слой тепловой карты данными
DOTSheatmapLayer.setData(DOTSheatmapData); // addData добавляется данные сразу