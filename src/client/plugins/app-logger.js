const appLogger = {}
appLogger.install = function (Vue, options) {
  if (appLogger.installed) return;

  if(!Vue.$electron || !Vue.$electron.ipcRenderer) {
    throw new Error("The electron service is not available")        
  }
  let ipcRenderer = Vue.$electron.ipcRenderer;

  var service = {
    debug(message, source, details) {    
      this.log('debug', message, source, details)
    },
    info(message, source, details) {
      this.log('info', message, source, details);
    },
    warn(message, source, details) {
      this.log('warning', message, source, details);
    },
    error(message, source, details) {
      if(details) {
        let detailInfo;
        if(details instanceof Error) { 
          var error = {
            message: details.message,
            stack: details.stack
          }     
          detailInfo = JSON.stringify(error);
        } else {
          detailInfo = details ? details: '';
        }          
        this.log('error', message, source, detailInfo);
      }
      else {
        this.log('error', message, source, null);
      }
    },
    log(type, message, source, details) {
      return new Promise((resolve, reject) => { 
        try {
          let msg = {
            type: type,
            message: message,
            source: source,
            details: details,
            timestamp: Date.now()
          };                                  
          ipcRenderer.send('log-client-message', msg);
          resolve(true);
        }
        catch(e) {
          if(console && console.error) {
            console.error(e);
          }
          reject(e);
        }
      });
    }
    
  }
  Vue.$log = service;
  Vue.prototype.$log = Vue.$log
}
export default appLogger;
