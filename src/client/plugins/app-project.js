import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const appProject = {
  electron: null,  
  log: null,
  projectInfo: null
}
appProject.install = function (Vue, options) {
  if (appProject.installed) return;

  if(!Vue.$electron || !Vue.$electron.ipcRenderer) {
    throw new Error("The electron service is not available")        
  }
  this.electron = Vue.$electron;

  if (!Vue.$log) {
    throw new Error("The log service is not available")        
  }
  this.log = Vue.$log;  

  let ipcRenderer = Vue.$electron.ipcRenderer;  
  let projectChangedSubject = new BehaviorSubject(false); 

  this.projectInfo = ipcRenderer.sendSync('read-project-info'); 
  if(this.projectInfo) {
    projectChangedSubject.next(true);
  } else {
    projectChangedSubject.next(false);
  }

  ipcRenderer.on('project-changed', (event, arg) => {
    this.projectInfo = ipcRenderer.sendSync('read-project-info');
    if(this.projectInfo) {
      projectChangedSubject.next(true);
    } else {
      projectChangedSubject.next(false);
    }
  });

  ipcRenderer.on('app-command', (event, arg) => {
    switch(arg.command) {
      case "openfile": {
        this.onOpenFile();
        break;
      }
      case "openfolder": {
        this.onOpenFolder();
        break;
      }
      case "save-current": {
        this.onSaveCurrent();
        break;
      }
      case "save-all": {
        this.onSaveAll();
        break;
      }
      case "close-project": {
        this.onCloseProject();
        break;        
      }
    }
  });
  
  let service = {
    changed: projectChangedSubject.asObservable(), 
    getProjectInfo: () => {
      return this.projectInfo;
    },
    setSelected(id) {
      return ipcRenderer.sendSync('project-command', {
        command: "set-selected",
        id: id
      }); 
    },
    getSource(id) {
      return ipcRenderer.sendSync('project-command', {
        command: "get-source",
        id: id
      }); 
    },
    getBasepath() {
      return ipcRenderer.sendSync('project-command', {
        command: "get-basepath"
      }); 
    },
    setSource(id, text) {
      return ipcRenderer.sendSync('project-command', {
        command: "set-source",
        id: id,
        source: text
      }); 
    },
    saveCurrent: () => {
      this.onSaveCurrent();
    }
  }
  Vue.$project = service;
  Vue.prototype.$project = Vue.$project
} 

appProject.onOpenFile = function () {
  this.log.debug("opening file", "appProject.onOpenFile");
  try {
    var result = this.electron.remote.dialog.showOpenDialog({
      title: "Select a Markdown file",
      filters: [
        { name: "Markdown", extensions: ["md"] },
        { name: "All Files", extensions: ["*"] }
      ],
      properties: ["openFile"]
    });
    if (result && result.length > 0) {
      let filePath = result[0];  
      this.electron.ipcRenderer.send('project-command', {
        command: "open",
        mode: "file",
        file: filePath
      });           
    }
  }
  catch(e) {
    this.log.error("error on open file", "appProject.onOpenFile", e);
  }
}

appProject.onOpenFolder = function () {
  this.log.debug("opening folder", "appProject.onOpenFolder");
  try {
    var result = this.electron.remote.dialog.showOpenDialog({
      title: "Select a folder with markdown files",
      properties: ["openDirectory"]
    });
    if (result && result.length > 0) {
      let folderPath = result[0];  
      this.electron.ipcRenderer.send('project-command', {
        command: "open",
        mode: "folder",
        folder: folderPath
      });  
    }
  }
  catch(e) {
    this.log.error("error on open folder", "appProject.onOpenFolder", e);
  }
}

appProject.onSaveCurrent = function () {
  this.log.debug("saving current", "appProject.onSaveCurrent", this.projectInfo ? this.projectInfo.selected : null);
  try {    
    if(this.projectInfo && this.projectInfo.selected) {
      this.electron.ipcRenderer.send('project-command', {
        command: "save-file",
        id: this.projectInfo.selected
      });      
    }
  }
  catch(e) {
    this.log.error("error saving current", "appProject.onSaveCurrent", e);
  }
}

appProject.onSaveAll = function () {
  this.log.debug("saving all", "appProject.onSaveAll");
  try {
    this.electron.ipcRenderer.send('project-command', {
      command: "save-all"
    });      
  }
  catch(e) {
    this.log.error("error saving all", "appProject.onSaveAll", e);
  }
}

appProject.onCloseProject = function () {
  this.log.debug("closing", "appProject.onCloseProject");
  try {
    this.electron.ipcRenderer.send('project-command', {
      command: "close-project"
    });      
  }
  catch(e) {
    this.log.error("error closing", "appProject.onCloseProject", e);
  }
}

export default appProject;
