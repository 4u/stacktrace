var Stack = require('../lib/stack');

function test(text) {
  var stack = new Stack(text);
  console.log(stack.lines);
  console.log(stack.meta);
};

console.log('Google Chrome');
test('TypeError: Cannot read property \'tagName\' of null\n' +
    'at a.getImgText (https://pstatic.datafastguru.info/nwp/External/NWPLegacy_v2.js:1:17083)\n' +
    'at Function.r.getImageText (https://pstatic.datafastguru.info/nwp/v0_0_411/release/Shared/SharedApp.js:3:10874)\n' +
    'at r.imageScrape (https://pstatic.datafastguru.info/nwp/v0_0_411/release/Shared/SharedApp.js:5:378)\n' +
    'at r.requestDataFromImage (https://pstatic.datafastguru.info/nwp/v0_0_411/release/Shared/SharedApp.js:4:31687)\n' +
    'at r.searchByImagesText (https://pstatic.datafastguru.info/nwp/v0_0_411/release/Shared/SharedApp.js:4:30657)\n' +
    'at r.scrapeAndSetDataIfNeeded (https://pstatic.datafastguru.info/nwp/v0_0_411/release/Shared/SharedApp.js:4:29842)\n' +
    'at https://pstatic.datafastguru.info/nwp/v0_0_411/release/Shared/SharedApp.js:4:29576\n' +
    'at c (https://hotels.pobeda.aero/st/singlepage/js/23fe15/module_owl_ru_app.js:456:287)');

console.log('Opera 27');
test('TypeError: Cannot read property \'arrive_before\' of undefined\n' +
    'at M9 (/st/singlepage/js/f6c553/module_ota_ru_voucher.js:5:134)\n' +
    'at __.d.fN (/st/singlepage/js/f6c553/module_ota_ru_voucher.js:43:416)\n' +
    'at Uf (https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:80:191)\n' +
    'at __.d.dispatchEvent (https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:604:346)\n' +
    'at Yk.dispatchEvent (https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:662:596)\n' +
    'at Tk (https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:166:203)\n' +
    'at __.d.LB (https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:660:20)\n' +
    'at c [as LB] (https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:463:287)\n' +
    'at __.d.IH (https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:659:503)');

console.log('Internet Explorer 11');
test('Error: Недостаточно памяти для завершения операции. \n' +
    '\n' +
    'at __.d.Ua (https://ostrovok.ru/st/singlepage/js/c1a591/module_ota_ru_app.js:662:32)\n' +
    'at __.Zk.prototype.Ua (https://ostrovok.ru/st/singlepage/js/c1a591/module_ota_ru_app.js:662:831)\n' +
    'at __.d.yT (https://ostrovok.ru/st/singlepage/js/c1a591/module_ota_ru_app.js:956:136)\n' +
    'at Uf (https://ostrovok.ru/st/singlepage/js/c1a591/module_ota_ru_app.js:80:182)\n' +
    'at __.d.dispatchEvent (https://ostrovok.ru/st/singlepage/js/c1a591/module_ota_ru_app.js:604:344)\n' +
    'at __.d.NQ (https://ostrovok.ru/st/singlepage/js/c1a591/module_ota_ru_app.js:954:153)\n' +
    'at Uf (https://ostrovok.ru/st/singlepage/js/c1a591/module_ota_ru_app.js:80:182)\n' +
    'at __.d.dispatchEvent (https://ostrovok.ru/st/singlepage/js/c1a591/module_ota_ru_app.js:604:344)\n' +
    'at Yk.prototype.dispatchEvent (https://ostrovok.ru/st/singlepage/js/c1a591/module_ota_ru_app.js:662:570)\n' +
    'at Tk (https://ostrovok.ru/st/singlepage/js/c1a591/module_ota_ru_app.js:166:201)');

console.log('Firefox');
test('__.d.isEnabled@https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:693:465\n' +
    '__.d.yA@https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:695:412\n' +
    'Qf@https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:77:69\n' +
    'Jf@https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:78:442\n' +
    'c@https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:463:285\n' +
    'Gf/b<@https://ostrovok.ru/st/singlepage/js/f6c553/module_ota_ru_app.js:74:333');

