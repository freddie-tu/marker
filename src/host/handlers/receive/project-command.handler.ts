import { Inject } from "typescript-ioc";
import { ILogService } from "../../services/log/interfaces";
import { IProjectService } from "../../services/project/interfaces";
import { IProjectCommandReceiveHandler } from "./interfaces";
import { shell } from 'electron'

import * as url from 'url';
import * as fs from 'fs'
import * as path from 'path';

export class ProjectCommandReceiveHandler extends IProjectCommandReceiveHandler {
  private _logService: ILogService;
  private _projectService: IProjectService;

  constructor(
    @Inject logService: ILogService,
    @Inject projectService: IProjectService) {
    super();
    this._logService = logService;
    this._projectService = projectService;
  }  

  public execute(event: any, arg: any): void { 
    this.log.debug("received project command", "ProjectCommandReceiveHandler.execute", arg);
    try {
      let command: string = arg.command;
      switch(command) {
        case "open": {
          this.handleOpenCommand(event, arg);  
          break;
        }
        case "set-selected": {
          this.handleSetSelectedCommand(event, arg);  
          break;
        }        
        case "get-source": {
          this.handleGetSourceCommand(event, arg);  
          break;
        }
        case "get-basepath": {
          this.handleGetBasepathCommand(event, arg);  
          break;
        }
        case "set-source": {
          this.handleSetSourceCommand(event, arg);  
          break;
        }
        case "save-file": {
          this.handleSaveFileCommand(event, arg);  
          break;
        }
        case "save-all": {
          this.handleSaveAllCommand(event, arg);  
          break;
        }
        case "close-project": {
          this.handleCloseProjectCommand(event, arg);  
          break;
        }
        case "try-navigate": {
          this.handleTryNavigateCommand(event, arg);  
          break;
        }        
        default: {
          event.returnValue = null; 
        }
      }
    } 
    catch(e) {
      this.log.error("error receiving project command", "ProjectCommandReceiveHandler.execute", e);      
      event.returnValue = null; 
    }         
  }

  private handleOpenCommand(event: any, arg: any): void  {
    this.log.debug("open project command", "ProjectCommandReceiveHandler.handleOpenCommand", arg);
    try {
      let mode: string = arg.mode;
      if(mode === "file") {
        let file: string = arg.file;
        if(file && file.length > 0) {
          this._projectService.loadFromFile(file);            
        }
      } else if(mode === "folder") {
        let folder: string = arg.folder;
        if(folder && folder.length > 0) {
          this._projectService.loadFromFolder(folder);            
        }
      }      
    } 
    catch(e) {
      this.log.debug("error open project command", "ProjectCommandReceiveHandler.handleOpenCommand", arg);
    }
    event.returnValue = null; 
  }
  private handleGetBasepathCommand(event: any, arg: any): void  {
    this.log.debug("get basepath command", "ProjectCommandReceiveHandler.handleGetBasepathCommand", arg);
    try {
        event.returnValue = this._projectService.getBasepath();
    }
    catch(e) {
      this.log.debug("error get source command", "ProjectCommandReceiveHandler.handleGetSourceCommand", arg);
      event.returnValue = null;
    }    
  }

  private handleGetSourceCommand(event: any, arg: any): void  {
    this.log.debug("get source command", "ProjectCommandReceiveHandler.handleGetSourceCommand", arg);
    try {
      let id: string = arg.id;
      if(id && id.length > 0) {
        event.returnValue = this._projectService.getFileSource(id);
      } else {
        event.returnValue = null;
      }
    }
    catch(e) {
      this.log.debug("error get source command", "ProjectCommandReceiveHandler.handleGetSourceCommand", arg);
      event.returnValue = null;
    }    
  }

  private handleSetSourceCommand(event: any, arg: any): void  {
    this.log.debug("set source command", "ProjectCommandReceiveHandler.handleSetSourceCommand", arg);
    try {
      let id: string = arg.id;
      let source: string = arg.source;
      if(id && id.length > 0) {
        event.returnValue = this._projectService.setFileSource(id, source);
      } else {
        event.returnValue = null;
      }
    }
    catch(e) {
      this.log.debug("error setting source command", "ProjectCommandReceiveHandler.handleSetSourceCommand", arg);
      event.returnValue = null;
    }    
  }

  private handleSetSelectedCommand(event: any, arg: any): void  {
    this.log.debug("set selected command", "ProjectCommandReceiveHandler.handleSetSelectedCommand", arg);
    try {
      let id: string = arg.id;
      let source: string = arg.source;
      if(id && id.length > 0) {
        event.returnValue = this._projectService.setSelected(id);
      } else {
        event.returnValue = null;
      }
    }
    catch(e) {
      this.log.debug("error set selected command", "ProjectCommandReceiveHandler.handleSetSelectedCommand", arg);
      event.returnValue = null;
    }    
  }


  private handleSaveFileCommand(event: any, arg: any): void  {
    this.log.debug("save file command", "ProjectCommandReceiveHandler.handleSaveFileCommand", arg);
    try {      
      let pi = this._projectService.getProjectInfo();
      let id: string = arg.id;
      if(pi && id) {
        this._projectService.saveFile(id);      
        event.returnValue = true;
      } else {
        event.returnValue = false;
      }
    }
    catch(e) {
      this.log.debug("error save file command", "ProjectCommandReceiveHandler.handleSaveFileCommand", arg);
      event.returnValue = null;
    }    
  }

  private handleSaveAllCommand(event: any, arg: any): void  {
    this.log.debug("save all command", "ProjectCommandReceiveHandler.handleSaveAllCommand", arg);
    try {      
      let pi = this._projectService.getProjectInfo();
      if(pi) {
        this._projectService.saveAll();      

        event.returnValue = true;
      } else {
        event.returnValue = false;
      }
    }
    catch(e) {
      this.log.debug("error save all command", "ProjectCommandReceiveHandler.handleSaveAllCommand", arg);
      event.returnValue = null;
    }    
  }

  private handleCloseProjectCommand(event: any, arg: any): void  {
    this.log.debug("close command", "ProjectCommandReceiveHandler.handleCloseProjectCommand", arg);
    try {      
      let pi = this._projectService.getProjectInfo();
      if(pi) {
        this._projectService.close();      
        event.returnValue = true;
      } else {
        event.returnValue = false;
      }
    }
    catch(e) {
      this.log.debug("error close command", "ProjectCommandReceiveHandler.handleCloseProjectCommand", arg);
      event.returnValue = null;
    }    
  }

  private handleTryNavigateCommand(event: any, arg: any): void  {
    this.log.debug("try navigate", "ProjectCommandReceiveHandler.handleTryNavigateCommand", arg);
    try {     
      var uri = arg.url;
      if(uri && uri.length > 0)
      {
        const linkUrl = url.parse(uri);
        if(linkUrl && !linkUrl.protocol) {
          let ext = path.extname(uri).toLowerCase();
          if(ext === ".md") {
            event.returnValue = this._projectService.setSelected(uri);
          } else {
            var pi = this._projectService.getProjectInfo()
            if(pi && pi.folder) {
              var extFilePath = path.join(pi.folder, uri);
              if (fs.existsSync(extFilePath)) {
                shell.openItem(extFilePath);                
              }
            }
          }
        }
      }
      event.returnValue = false;
    }
    catch(e) {
      this.log.debug("error try navigate", "ProjectCommandReceiveHandler.handleTryNavigateCommand", arg);
      event.returnValue = null;
    }    
  }
  

  private get log(): ILogService {
    return this._logService;
  }  
}