//Иконки и точечные объекты
// Создание собственного экземпляра класса на основе Icon
var rwStIcn = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -23]
  }
});
// Формирование массива иконок на основе собственного класса rwStIcn
var rwStIcns = [
  new rwStIcn({ iconUrl: 'data/icons/railway-station_yng.png' }),
  new rwStIcn({ iconUrl: 'data/icons/railway-station_avg.png' }),
  new rwStIcn({ iconUrl: 'data/icons/railway-station_old.png' })
];
// Добавление данных из GeoJSON-файла на карту
const aquaparkyLayer = L.geoJSON(aquaparksMsk, {
  pointToLayer: function (feature, latlng) {
    let wifi = feature.properties.HasWifi,
      disability = feature.properties.DisabilityFriendly;
    wifi == 'нет' && disability == 'не приспособлен' ? icn = rwStIcns[2] :
      wifi == 'да' && disability == 'частично приспособлен' ? icn = rwStIcns[0] :
        icn = rwStIcns[1];
    return L.marker(latlng, {
      title: feature.properties.Address,
      icon: icn
    })
  },
})
  .bindPopup(function (aquaparksMsk) {
    let aquaparkPhoto = '';
    if (aquaparksMsk.feature.properties.photo) { //Как в Groovy
      aquaparkPhoto = '<img src="data/shapes/aquaparks/photos/' + aquaparksMsk.feature.properties.global_id + '/photo.jpg" width=285px height=214px>'
    };
    return '<b>Название: </b><i>' + aquaparksMsk.feature.properties.ObjectName + '</i><br>' + aquaparkPhoto;
  });

//Кластеризация
// Реализация кластеризации слоя с аквапарками
//  Создание сущности с заранее определенными настройками кластеризации
const clusterAquaparks = L.markerClusterGroup({
  maxClusterRadius: 300,
  disableClusteringAtZoom: 16, // оптимально 16
  spiderLegPolylineOptions: {
    weight: 3,
    color: '#8400ff',
    opacity: 0.8
  },
  spiderflyOnMaxZoom: false, //запрет на распадание на составные части
  zoomToBoundsOnClick: true, //Увеличить масштаб, щелкнув по кнопке
  showCoverageOnHover: true, //показывать Площадь покрытия При Наведении Курсора
  removeOutsideVisibleBounds: true //убрать невидимые за экраном объекты
});
//  Добавление в сущность объектов из слоя аквапарка
clusterAquaparks.addLayer(aquaparkyLayer);

//Тепловая карта (интенсивности)
// Реализация слоя тепловой карты
//  Массив точечных объектов, на основе которых будет строится тепловая карта
const heatmapData = {
  max: 5,
  data: [
    { lng: 37.738621739347131, lat: 55.654621011084217, count: 1 },
    { lng: 37.738621739347131, lat: 55.654621011084217, count: 1 },
    { lng: 37.527184, lat: 55.597246, count: 1 },
    { lng: 37.778529036593255, lat: 55.74788542982435, count: 1 },
    { lng: 37.738880486434965, lat: 55.654422175766456, count: 1 },
    { lng: 37.739034077686618, lat: 55.654693281892321, count: 2 },
    { lng: 37.778447779810733, lat: 55.747720786351714, count: 1 }
  ]
};
//  Список настроек для создания поля тепловрй карты
const heatmapCfg = {
  "radius": 50,
  "scaleRadius": false, //при false радиус в пикселях, иначе коэффициент
  "maxOpacity": 0.8,
  "useLocalExtrema": true,
  "latField": 'lat',
  "lngField": 'lng',
  "valueField": "count"
};
//  Создание слоя тепловой карты
const heatmapLayer = new HeatmapOverlay(heatmapCfg);
//  Наполняем слой тепловой карты данными
heatmapLayer.setData(heatmapData); // addData добавляется данные сразу

/*
//Линейный объект или полигон
//Создание линейного объекта
L.polygon([[55.757344, 37.660779],
//L.polygon([[55.757344, 37.660779],
[55.776748, 37.657313],
[55.773550, 37.656401], [55.757344, 37.660779]
], {
  color: 'green',
  fillColor: 'red',
  fillOpacity: 0.8,
  //fillRule: 'nonzero',
  opacity: 1,
  weight: 2,
  lineCap: 'round',
  lineJoin: 'round',
  stroke: true,
  //dashOffset: 3,
  dashArray: "10 7"
}).addTo(myMap);
*/

//Легенда
// Создание нового элемента интерфейса "Легенда"
var lgnd = L.control({
  position: 'bottomright'
});
// Наполнение элемента интерфейса "Легенда"
lgnd.onAdd = function (myMap) {
  let lgndDiv = L.DomUtil.create('div', 'mapLgnd'),
    labels = [];
  L.DomEvent
    .disableScrollPropagation(lgndDiv)
    .disableClickPropagation(lgndDiv);
  labels.push('<center><b>Легенда для слоя с аквапарками</b></center>');
  //labels.push('');
  labels.push('<img src="data/icons/aquapark_yng.png" height="14" width="14"> - Аквапарки с Wi-Fi и удобством для инвалидов');
  labels.push('<img src="data/icons/aquapark_avg.png" height="14" width="14"> - Аквапарки с Wi-Fi или с удобством для инвалидов');
  labels.push('<img src="data/icons/aquapark_old.png" height="14" width="14"> - Аквапарки без Wi-Fi и удобств для инвалидов');
  lgndDiv.innerHTML = labels.join('<br>');
  return lgndDiv
};
// Добавление элемента интерфейса "Легенда" на карту
//lgnd.addTo(myMap);
// Реализация возможности отображения/скрытия легенды интерфейса "Легенда" при выборе слоя aquaparkyLayer
function lgndAdd() {
  lgnd.addTo(myMap);
};
function lgndRemove() {
  lgnd.remove(myMap);
};
aquaparkyLayer.on('add', lgndAdd);
aquaparkyLayer.on('remove', lgndRemove);
//clusterAquaparks.on('add', lgndAdd);
//clusterAquaparks.on('remove', lgndRemove);