import { app, dialog, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions, Tray, nativeImage, protocol } from 'electron'
import { AutoWired, Inject, Container, Scope, Provider } from "typescript-ioc";

import * as path from 'path'
import * as url from 'url'

//services
import { IAppRuntimeService,  IAppModuleService, IWindowService } from "./services/app/interfaces"
import { AppModuleService } from './services/app/app-module.service';
import { AppRuntimeService } from './services/app/app-runtime.service';
import { WindowService } from './services/app/window.service';
import { IConfigService } from './services/config/interfaces';
import { ConfigService } from './services/config/config.service'
import { ILogService, ILogHandler } from './services/log/interfaces';
import { LogService } from './services/log/log.service';
import { IProjectService } from './services/project/interfaces';
import { ProjectService } from './services/project/project.service';
import { IConverterService } from './services/converter/interfaces';
import { ConverterService } from './services/converter/converter.service'

//handlers
import { IAppCommandSendHandler, INavigationRequestSendHandler, IProjectChangedSendHandler } from './handlers/send/interfaces';
import { AppCommandSendHandler } from './handlers/send/app-command.handler';
import { NavigationRequestSendHandler } from './handlers/send/navigation-request.handler';
import { ProjectChangedSendHandler } from './handlers/send/project-changed.handler'
import { ILogClientMessageReceiveHandler, IReadProjectInfoReceiveHandler, IProjectCommandReceiveHandler, IConvertCommandReceiveHandler } from './handlers/receive/interfaces';
import { LogClientMessageReceiveHandler } from './handlers/receive/log-client-message.handler';
import { ReadProjectInfoReceiveHandler } from './handlers/receive/read-projectinfo.handler'
import { ProjectCommandReceiveHandler } from './handlers/receive/project-command.handler';
import { ConvertCommandReceiveHandler } from './handlers/receive/convert-command.handler';
import { LogHandler } from './services/log/log.handler';

export class MainApp implements Provider {  
  private _appModuleService: AppModuleService;
  private _mainWindow: BrowserWindow;    

  constructor() { 
  }
  
  public get() {
    return this._appModuleService;
  }

  public get mainWindow(): BrowserWindow {
    return this._mainWindow;
  }

  public ready() {   
    //init        
    this.initContainer();
    this.initServices();
    this.initSendHandlers(); 
    this.initReceiveHandlers();

    //window
    this.createMainWindow();    
  }

  public quit() {
    var appRuntimeService = Container.get(IAppRuntimeService);
    if (appRuntimeService) {
        appRuntimeService.quit();
    }
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }  

  private initContainer() {
    this._appModuleService = new AppModuleService(this);

    //services
    Container.bind(IAppModuleService).provider(this).scope(Scope.Singleton);
    Container.bind(IAppRuntimeService).to(AppRuntimeService).scope(Scope.Singleton);    
    Container.bind(IWindowService).to(WindowService).scope(Scope.Singleton);    
    Container.bind(ILogService).to(LogService).scope(Scope.Singleton);    
    Container.bind(IConfigService).to(ConfigService).scope(Scope.Singleton);      
    Container.bind(ILogHandler).to(LogHandler).scope(Scope.Singleton);  
    Container.bind(IProjectService).to(ProjectService).scope(Scope.Singleton);   
    Container.bind(IConverterService).to(ConverterService).scope(Scope.Singleton);       
    
    //send handlers
    Container.bind(IAppCommandSendHandler).to(AppCommandSendHandler).scope(Scope.Singleton);
    Container.bind(INavigationRequestSendHandler).to(NavigationRequestSendHandler).scope(Scope.Singleton);    
    Container.bind(IProjectChangedSendHandler).to(ProjectChangedSendHandler).scope(Scope.Singleton);

    //receive handlers
    Container.bind(ILogClientMessageReceiveHandler).to(LogClientMessageReceiveHandler).scope(Scope.Singleton);
    Container.bind(IReadProjectInfoReceiveHandler).to(ReadProjectInfoReceiveHandler).scope(Scope.Singleton);
    Container.bind(IProjectCommandReceiveHandler).to(ProjectCommandReceiveHandler).scope(Scope.Singleton);   
    Container.bind(IConvertCommandReceiveHandler).to(ConvertCommandReceiveHandler).scope(Scope.Singleton);        
  }

  private initServices() {
    var appRuntimeService = Container.get(IAppRuntimeService);
    if (appRuntimeService) {
      appRuntimeService.init();
    }
  }

  private initSendHandlers() {       
    Container.get(INavigationRequestSendHandler).create('navigate');
    Container.get(IAppCommandSendHandler).create('app-command');
    Container.get(IProjectChangedSendHandler).create('project-changed');    
  }

  private initReceiveHandlers() {
    ipcMain.on('log-client-message', (event: any, arg: any) => {
      var handler = Container.get(ILogClientMessageReceiveHandler);            
      handler.execute(event, arg);
    });
    ipcMain.on('read-project-info', (event: any, arg: any) => {
      var handler = Container.get(IReadProjectInfoReceiveHandler);            
      handler.execute(event, arg);
    });
    ipcMain.on('project-command', (event: any, arg: any) => {
      var handler = Container.get(IProjectCommandReceiveHandler);            
      handler.execute(event, arg);
    });
    ipcMain.on('convert-command', (event: any, arg: any) => {
      var handler = Container.get(IConvertCommandReceiveHandler);            
      handler.execute(event, arg);
    });
  } 

  private createMainWindow(): void {
    var windowService = Container.get(IWindowService);    
    if(windowService) {
      this._mainWindow = windowService.createMainWindow();
    }
  }
}

// Run
let mainApp: MainApp = new MainApp();
app.on('ready', () => mainApp.ready());

/*
//hack for debug
app.on('ready', () => setTimeout(() => {
  mainApp.ready();
}, 10000));
*/

app.on('window-all-closed', () => mainApp.quit());
