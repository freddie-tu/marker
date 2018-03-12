import { Inject } from 'typescript-ioc';
import { BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron'

import * as process from 'process'
import * as path from 'path'
import * as url from 'url'

import { IWindowService } from "./interfaces";
import { ILogService } from '../log/interfaces';
import { IConfigService } from '../config/interfaces';
import { INavigationRequestSendHandler, IAppCommandSendHandler } from '../../handlers/send/interfaces';

export class WindowService extends IWindowService {
  private _logService: ILogService;
  private _configService: IConfigService;
  private _navigationRequestHandler: INavigationRequestSendHandler;
  private _appCommandHandler: IAppCommandSendHandler;

  constructor(
    @Inject logService: ILogService,
    @Inject configService: IConfigService,
    @Inject navigationRequestHandler: INavigationRequestSendHandler,
    @Inject projectCommandHandler: IAppCommandSendHandler) {
    super();
    this._logService = logService;    
    this._configService = configService;
    this._navigationRequestHandler = navigationRequestHandler;
    this._appCommandHandler = projectCommandHandler;
  }

  public createMainWindow(): BrowserWindow {
    let window = new BrowserWindow({
      width: 1281,
      height: 800,
      backgroundColor: "#333",
      show: true
    });
    var indexUrl = url.format({
      pathname: path.join(__dirname, 'client', 'index.html'),
      protocol: 'file:',
      slashes: true
    })
    window.loadURL(indexUrl);

    let mainMenu = this.createMainMenu(window);
    window.setMenu(mainMenu);

    return window;
  }

  private createMainMenu(window: BrowserWindow): Menu {   

    let isDebugMode = (this._configService.getValue("debug") == true);
    
    let navigationRequestHandler = this._navigationRequestHandler;
    let appCommandHandler = this._appCommandHandler;
    let mainMenuTemplate: MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          /*
          {
            label: "New File",
            click() {
              appCommandHandler.execute({command: "newfile"});
            }
          },
          {
            label: "New Folder",
            click() {
              appCommandHandler.execute({command: "newfolder"});
            }
          },        
          { type: 'separator' },
          */
          {
            label: "Open File",
            click() {
              appCommandHandler.execute({command: "openfile"});
            }
          },
          {
            label: "Open Folder",
            click() {
              appCommandHandler.execute({command: "openfolder"});
            }
          },
          { type: 'separator' },
          {
            label: "Save Current",
            click() {
              appCommandHandler.execute({command: "save-current"});
            }
          },
          {
            label: "Save All",
            click() {
              appCommandHandler.execute({command: "save-all"});
            }
          },
          { type: 'separator' },
          {
            label: "Close",
            click() {
              appCommandHandler.execute({command: "close-project"});
            }
          },
          {
            label: "Exit",
            click() {
              window.close();
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
          { type: 'separator' },
          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: "Debug",
            click() {
              navigationRequestHandler.execute('/help/debug')
            }
          },
          { type: 'separator' },
          {
            label: "About",
            click() {
              navigationRequestHandler.execute('/help/about')
            }
          }
        ]
      },
    ];  

    if (!isDebugMode) {
      let submenu = mainMenuTemplate.find(m => m.label === 'View').submenu;
      if(submenu instanceof Array) {
          submenu.find(m => m.role === 'toggledevtools').visible = false;
          submenu.find(m => m.role === 'forcereload').visible = false;
      }
      submenu = mainMenuTemplate.find(m => m.label === 'Help').submenu;
      if(submenu instanceof Array) {
        submenu.find(m => m.label === 'Debug').visible = false;
      }
    } 
    
    return Menu.buildFromTemplate(mainMenuTemplate);
  }
}