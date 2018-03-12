import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const viewConnect = {}
viewConnect.install = function (Vue, router) {
  if (viewConnect.installed) return;

  if(!Vue.$electron || !Vue.$electron.ipcRenderer) {
    throw new Error("The electron service is not available")        
  }
  if (!Vue.$log) {
    throw new Error("The log service is not available")        
  }

  const electron = Vue.$electron;
  const log = Vue.$log;  
  const ipcRenderer = electron.ipcRenderer;
  
  let propertySubject = new BehaviorSubject({
    mode: null
  });
  let htmlSubject = new BehaviorSubject(null);

  ipcRenderer.on('view-set-props', (event, arg) => {   
    let props = arg || {};
    let current = propertySubject.value;
    if(props.mode) {
      if(props.mode === "view" || props.mode === "print") {
        current.mode = props.mode;
      }
    }
    propertySubject.next(current);
  });       
  ipcRenderer.on('view-set-html', (event, arg) => {
    htmlSubject.next(arg);
  });   

  ipcRenderer.sendToHost('view-ready')

  let service = {
    properies: propertySubject.asObservable(),
    html: htmlSubject.asObservable(), 
  }  

  Vue.$connect = service;
  Vue.prototype.$connect = Vue.$connect
}
export default viewConnect;  