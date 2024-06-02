//Просмотр пробок от Яндекс
// Создание функции для трансляции дорожной обстановки через Яндекс АПИ
function traffic() {
  var trafficProvider = new ymaps.traffic.provider.Actual({}, {
    infoLayerShown: true
  });
  trafficProvider.setMap(this._yandex);
};
// Перехват контейнера с элементами интерфейса для изменения стилей
L.Yandex.addInitHook('on', 'load', function () {
  this._setStyle(this._yandex.controls.getContainer(), {
    width: 'auto',
    right: '50px',
    top: '11px'
  });
});
//Создание функции для трансляции дорожной обстановки через Yandex API с элементами управления
function trafficCtrl() {
  this._yandex.controls
    .add('trafficControl', { size: 'auto' })
    //.add('typeSelector', { size: 'auto' })
    .get('traddicControl').state.set('trafficShown', true)
};

//Создание слоёв
// Создание объекта базовых слоёв
const
  podlozhka = L.tile
// Карта OSM
bm = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png'),
  // Карта OSM (тёмная)
  bmOSMDark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    attribution: '<i><b>Map by OSM & CartoDB</b></i>'
  }),
  //Google спутник
  gSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 19,
    attribution: '<i><b>Googe sattelite images</b></i>'
  }),
  // Объекты ООПТ
  mapOOPT = L.tileLayer.wms('http://lgtgis.aari.ru/arcgis/services/MCPA/PAWMS_lite/MapServer/WMSServer', {
    layers: '0,1',
    format: 'image/png',
    transparent: true,
    attribution: '<i><b>Данные ООПТ</b></i>'
  }),
  // Yandex карта
  yMap = L.yandex('map', {
    //attribution: '<i><b>yMap</b></i>' // Не прописывали
  }),
  // Яндекс пробки
  yTraffic = L.yandex('overlay', {
    attribution: '<i><b>Данные Yandex</b></i>'
  }).on('load', traffic), //load activation, вызывает функцию траффик)
  // Яндекс пробки с элементами управления
  yTrafficCtrl = L.yandex('overlay', {
    attribution: '<i><b>Данные Yandex</b></i>'
  }).on('load', trafficCtrl);

//Иконки и точечные объекты
// Создание собственного экземпляра класса на основе Icon
var oneIcon = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -23]
  }
});
// Формирование массива иконок на основе собственного класса oneIcon
var rwStIcns = [
  new oneIcon({ iconUrl: 'data/icons/railway-station_yng.png' }),
  new oneIcon({ iconUrl: 'data/icons/railway-station_avg.png' }),
  new oneIcon({ iconUrl: 'data/icons/railway-station_old.png' })
];
//Иконки для аквапарков
var aquaIcns = [
  new oneIcon({ iconUrl: 'data/icons/aquapark_yng.png' }),
  new oneIcon({ iconUrl: 'data/icons/aquapark_avg.png' }),
  new oneIcon({ iconUrl: 'data/icons/aquapark_old.png' })
];
// Агрегация точечных объектов в один слой
const railwayStations = L.layerGroup([
  // Создание точечных объектов на местности
  L.marker([55.757344, 37.660779], { //#1
    title: 'Курский вокзал',
    icon: rwStIcns[0],
    //opacity: 0.5
  })
    .bindPopup('<b>Название вокзала: </b><i>Курский вокзал</i><br><img src="data/photos/kur.jpg" width=250px height=155px>'),
  L.marker([55.776748, 37.657313], { //#3
    title: 'Ярославский вокзал',
    icon: rwStIcns[2]
  })
    .bindPopup('<b>Название вокзала: </b><i>Ярославский вокзал</i><br><img src="data/photos/yar.jpeg" width=250px height=px>'),
  L.marker([55.773550, 37.656401], { //#2
    title: 'Казанский вокзал',
    icon: rwStIcns[1],
    //zIndexOffset: -500
  })
    .bindPopup('<b>Название вокзала: </b><i>Казанский вокзал</i><br><img src="data/photos/kaz.jpg" width=250px height=px>'),
]);
// Добавление данных из GeoJSON-файла на карту
const aquaparkyLayer = L.geoJSON(aquaparksMsk, {
  pointToLayer: function (feature, latlng) {
    let wifi = feature.properties.HasWifi,
      disability = feature.properties.DisabilityFriendly;
    wifi == 'нет' && disability == 'не приспособлен' ? icn = aquaIcns[2] :
      wifi == 'да' && disability == 'частично приспособлен' ? icn = aquaIcns[0] :
        icn = aquaIcns[1];
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

//Базовая карта и слои
// Создание объекта карты
var myMap = L.map('map', {
  center: [55.763700, 37.661723],
  zoom: 11, // было 14
  layers: [bm], // Карта по умолчаннию
});
// Удаление флага и ссылки на Leaflet
myMap.attributionControl.setPrefix(false);
// Формирование списка базовых слоев
var baseLayers = {
  'Карта OSM': bm,
  'Карта OSM (тёмная)': bmOSMDark,
  'Google спутник': gSat,
  'Yandex карта': yMap
};
// Формирование списка оверлей-слоев
var overlayLayers = {
  'Объекты ООПТ': mapOOPT,
  'Яндекс пробки': yTraffic,
  'Яндекс пробки с элементами управления': yTrafficCtrl,
  'ЖД вокзалы Москвы': railwayStations,
  'Открытые Аквапарки Москвы': aquaparkyLayer,
  'Открытые Аквапарки Москвы (кластеризованные)': clusterAquaparks,
  'Открытые Аквапарки Москвы (тепловая карта)': heatmapLayer,
  'Точечный уровень дз': dotsdzLayer,
  'Точечный уровень дз (кластеризованный)': clusterDotsdz,
  'Точечный уровень дз (тепловая карта)': DOTSheatmapLayer,
  'Линейный уровень дз': linedzLayer,
  'Линейный уровень дз (кластеризованный)': clusterLinedz,
  'Линейный уровень дз (тепловая карта)': LINESheatmapLayer,
  'Площадной уровень дз': squaredzLayer,
  //'Точечный уровень дз (кластеризованный)': true,
  //'Точечный уровень дз (тепловая карта)': true,
}
// Добавление переключателя слоёв
L.control.layers(baseLayers, overlayLayers).addTo(myMap);

//Линейка
// Добавление масштабной линейки
L.control.scale({
  imperial: false,
  maxWidth: 150,
  //position: 'bottomright'
}).addTo(myMap);
// Создание элемента интерфейса для проведения измерений по карте
var msrCtrl = new L.Control.Measure({
  localization: 'ru',
  primaryLenghtUnit: 'kilometers',
  secondaryLengthUnit: 'meters',
  primaryAreaUnit: 'hectares',
  secondaryAreaUnit: 'sqmeters',
  decPoint: ',',
  thousandsSep: ' ',
  activeColor: '#ff8200',
  completedColor: '#ef611e',
});
// Добавление элемента интерфейса для проведения измерений по карте
msrCtrl.addTo(myMap);

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