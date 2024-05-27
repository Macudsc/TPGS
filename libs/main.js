//Просмотр пробок от Яндекс
// Создание функции для трансляции дорожной обстановки через Яндекс АПИ
function traffic() {//+
  var trafficProvider = new ymaps.traffic.provider.Actual({}, {//+
    infoLayerShown: true//+
  });//+
  trafficProvider.setMap(this._yandex);//+
};//+
// Перехват контейнера с элементами интерфейса для изменения стилей
L.Yandex.addInitHook('on', 'load', function () {//+
  this._setStyle(this._yandex.controls.getContainer(), {//+
    width: 'auto',//+
    right: '50px',//+
    top: '11px'//+
  });//+
});//+
//Создание функции для трансляции дорожной обстановки через Yandex API с элементами управления
function trafficCtrl() {//+
  this._yandex.controls//+
    .add('trafficControl', { size: 'auto' })//+
    //.add('typeSelector', { size: 'auto' })//+
    .get('traddicControl').state.set('trafficShown', true)//+
};//+


//Создание слоёв
//создание объекта базовых слоёв
const
  //Карта OSM
  bm = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png'), //+
  //Карта OSM (тёмная)
  bmOSMDark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    attribution: '<i><b>Map by OSM & CartoDB</b></i>'
  }), //+
  //Google спутник
  gSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {//+
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],//+
    maxZoom: 19,//+
    attribution: '<i><b>Googe sattelite images</b></i>'//+
  }),//+
  //Объекты ООПТ
  mapOOPT = L.tileLayer.wms('http://lgtgis.aari.ru/arcgis/services/MCPA/PAWMS_lite/MapServer/WMSServer', {//+
    layers: '0,1',//+
    format: 'image/png',//+
    transparent: true,//+
    attribution: '<i><b>Данные ООПТ</b></i>'//+
  }),//+
  //Yandex карта
  yMap = L.yandex('map'),//+
  //Яндекс пробки
  yTraffic = L.yandex('overlay', {//+
    attribution: '<i><b>Данные Yandex</b></i>'//+
  }).on('load', traffic), //load activation, вызывает функцию траффик)
  //Яндекс пробки с элементами управления
  yTrafficCtrl = L.yandex('overlay', {//+
    attribution: '<i><b>Данные Yandex</b></i>'
  }).on('load', trafficCtrl);//+


//Базовая карта и слои
//Создание объекта карты
var myMap = L.map('map', {//+
  center: [55.758442, 37.657614],//+
  zoom: 14,//+
  layers: [bm] //+ Карта по умолчаннию
});//+
//Удаление флага и ссылки на Leaflet
myMap.attributionControl.setPrefix(false);//+
//Формирование списка базовых слоев
var baseLayers = {//+
  'Карта OSM': bm,//+
  'Карта OSM (тёмная)': bmOSMDark,//+
  'Google спутник': gSat,//+
  'Yandex карта': yMap//+
};//+
//Формирование списка оверлей-слоев
var overlayLayers = {//+
  'Объекты ООПТ': mapOOPT,//+
  'Яндекс пробки': yTraffic,//+
  'Яндекс пробки с элементами управления': yTrafficCtrl//+
}//+
//Добавление переключателя слоёв
L.control.layers(baseLayers, overlayLayers).addTo(myMap);//+


//Линейка
//Добавление масштабной линейки
L.control.scale({//+
  imperial: false,//+
  maxWidth: 150,//+
  //position: 'bottomRight'
}).addTo(myMap);//+
//Создание элемента интерфейса для проведения измерений по карте
var msrCtrl = new L.Control.Measure({//+
  localization: 'ru',//+
  primaryLenghtUnit: 'kilometers',//+
  secondaryLengthUnit: 'meters',//+
  primaryAreaUnit: 'hectares',//+
  secondaryAreaUnit: 'sqmeters',//+
  decPoint: ',',//+
  thousandsSep: ' ',//+
  activeColor: '#efb41e',//+
  completedColor: '#ef611e'//+
});//+
//Добавление элемента интерфейса для проведения измерений по карте
msrCtrl.addTo(myMap);//+