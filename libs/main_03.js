// Трансляция дорожной обстановки через Яндекс АПИ
function traffic() {
  var trafficProvider = new ymaps.traffic.provider.Actual({}, {
    infoLayerShown: true
  }); //Надо реализовывать так, как в Яндекс апи
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
    .get('traddicControl').state.set('trafficShown', true);
}

//создание объекта базовых слоёв
const bm = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png'),
  bmOSMDark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    attribution: '<i><b>Map by OSM & CartoDB</b></i>'
  }),
  gSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 19,
    attribution: '<i><b>Googe sattelite images</b></i>'
  });
mapOOPT = L.tileLayer.wms('http://lgtgis.aari.ru/arcgis/services/MCPA/PAWMS_lite/MapServer/WMSServer', {
  layers: '0',
  format: 'image/png',
  transparent: true,
  attribution: '<i><b>Данные ООПТ</b></i>'
}),

  yMap = L.yandex('map'),
  yTraffic = L.yandex('overlay', {
    attribution: '<i><b>Данные Yandex</b></i>'
  })
    .on('load', trafficCtrl), //load activation, вызывает функцию траффик)
  yTrafficCtrl = L.yandex('overlay', {

  });


//map create
var myMap = L.map('map', {
  center: [55.758442, 37.657614],
  zoom: 14,
  layers: [yMap]
});

//Удаление флага и ссылки на Leaflet
myMap.attributionControl.setPrefix(false);

//Список базовых слоев
var baseLayers = {
  'Yandex-karta': yMap,
  'Карта OSM': bm,
  'Карта OSM (Темная)': bmOSMDark,
  'Спутник google': gSat
};

//Список оверлей-слоев
var overlayLayers = {
  'Объекты ООПТ': mapOOPT,
  'Яндекс пробки': yTraffic,
  'Яндекс пробки с элементами управления': yTrafficCtrl
}
//Переключатель слоёв
L.control.layers(baseLayers, overlayLayers).addTo(myMap);


//Добавление масштабной линейки
L.control.scale({
  imperial: false,
  maxWidth: 150,
  //position: 'bottomRight'
}).addTo(myMap);


//Создание элемента интерфейса для проведения измерений по карте
var msrCtrl = new L.Control.Measure({
  localization: 'ru',
  primaryLenghtUnit: 'kilometers',
  secondaryLengthUnit: 'meters',
  primaryAreaUnit: 'hectares',
  secondaryAreaUnit: 'sqmeters',
  decPoint: ',',
  thousandsSep: ' ',
  activeColor: '#efb41e',
  completedColor: '#ef611e'
});

//Добавление на карту элемента интерфейса для проведения измерений по карте
//msrCtrl.addTo(myMap);
//  </script >

//  < !--< script >
//    var map = L.map('map').setView([51.505, -0.09], 13);

//L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//  maxZoom: 19,
//}).addTo(map);

//L.marker([51.5, -0.09]).addTo(map)
//  .bindPopup('Привет, я студент МИИГАИК и мне нравится это!')
//  .openPopup();
//  </ > -->