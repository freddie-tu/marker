const appElectron = {}
appElectron.install = function (Vue, router) {
  if (appElectron.installed) return;

  let electron = require('electron');
  let ipcRenderer = electron.ipcRenderer;
  if(ipcRenderer) {
    ipcRenderer.on('navigate', (event, arg) => {
      router.push(arg);
    });            
  }

  Vue.$electron = electron;
  Vue.prototype.$electron = Vue.$electron
}
export default appElectron;
