import { Inject } from 'typescript-ioc';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";

import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

import { MainApp } from "../../main";
import { ILogService } from '../log/interfaces';
import { IConfigService } from './interfaces';

export class ConfigService extends IConfigService {
  private _log: ILogService;

  private _configPath: string;
  private _changed: Subject<boolean> = new Subject<boolean>();  
  private _modified: false;
  private _config: object = {};

  constructor(@Inject logService: ILogService) {
    super();
    this._log = logService;
  }

  public get changed(): Observable<boolean> {
    return this._changed.asObservable();
  }

  public getValue(key: string): any {
    if(!this._config) {
      return undefined;
    }
    if(!this._config[key]) {
      return undefined;
    }
    return this._config[key];
  }

  public setValue(key: string, value: any): boolean {
    if(!this._config) {
      return false;
    }
    if(this._config[key]) {
      if(this._config[key] != value) {
        this._config[key] = value;
        this._changed.next(true);          
      }
      return true;      
    } else {
      this._config[key] = value;
      this._changed.next(true);
      return true;       
    }
  }

  public getConfigData() : object {
    return this._config;
  }

  public setConfigData(data: object): void {
    if(data != this._config) {
      if(data) {
        this._config = data;
        
      } else {
        this._config = {};
      }
      this._changed.next(true);
    }
  }

  public init() {
    this.log.debug("initailizing the configuration", "ConfigService.init");

    //check/init the path
    let dataPath = this.findDataPath();
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath);
    }

    let config: object;
    let configPath = path.join(dataPath, "marker.config.json");
    if (fs.existsSync(configPath)) {
      this.log.debug(`loading config from ${configPath}`);
      let fd = fs.openSync(configPath, 'r');
      var json = fs.readFileSync(fd, 'utf8');
      fs.closeSync(fd); 
      config = JSON.parse(json);
    } else {
      this.log.debug(`saving initial config to ${configPath}`);
      config = {};
      let fd = fs.openSync(configPath, 'w');
      fs.writeFileSync(fd, JSON.stringify(config), 'utf8');
      fs.closeSync(fd);
    }

    this._configPath = configPath; 
    this._config = config;
    this._modified = false;
    this._changed.next(true);
  }

  public save(): boolean {
    this.log.debug("saving the configuration", "ConfigService.save");
    
    if(this._configPath && !this._modified) {
      return false;
    }    
    let configPath = this._configPath;
    if (!configPath) { 
      let dataPath = this.findDataPath();
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath);
      }
      configPath = path.join(dataPath, "marker.config.json");
    }
    let fd = fs.openSync(configPath, 'w');
    fs.writeFileSync(fd, JSON.stringify(this._config), 'utf8');
    fs.closeSync(fd);
    this.log.debug(`saved config to ${configPath}.`);
    this._modified = false;
    this._configPath = configPath;
    this._changed.next(true);
    return true;
  }

  public getDataPath(): string {
    return this.findDataPath();
  }

  public getAppPath(): string {
    return app.getAppPath();
  }

  public getAppName(): string {
    return app.getName();
  }

  public getAppDataPath(): string {
    return app.getPath('appData');
  }

  public getUserDataPath(): string {
    return app.getPath('userData');
  }

  public getTempPath(): string {
    return app.getPath('temp');
  }

  private get log(): ILogService {
    return this._log;
  }

  private findDataPath() : string {
    let dataPath = this.getUserDataPath();
    if (dataPath.indexOf('marker') === -1) { 
      //hack
      if (path.win32.basename(dataPath).toLowerCase() === 'electron') {
        dataPath = path.win32.dirname(dataPath);
      }
      dataPath = path.join(dataPath, 'marker');
    }
    return dataPath;
  }
}