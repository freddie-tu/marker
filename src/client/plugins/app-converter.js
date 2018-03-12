const appConverter = {}
appConverter.install = function (Vue, options) {
  if (appConverter.installed) return;

  if(!Vue.$electron || !Vue.$electron.ipcRenderer) {
    throw new Error("The electron service is not available")        
  }
  let ipcRenderer = Vue.$electron.ipcRenderer;

  if (!Vue.$log) {
    throw new Error("The log service is not available")        
  }
  this.log = Vue.$log;

  var service = {
    convert(source) {   
      let result = ipcRenderer.sendSync('convert-command', {
        command: "convert",
        source: source
      });
      return result;
    }
  }
  Vue.$converter = service;
  Vue.prototype.$converter = Vue.$converter
}
export default appConverter;
