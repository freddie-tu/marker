const viewElectron = {}
viewElectron.install = function (Vue) {
  if (viewElectron.installed) return;

  const electron = require('electron');
  
  Vue.$electron = electron;
  Vue.prototype.$electron = Vue.$electron
}
export default viewElectron;
