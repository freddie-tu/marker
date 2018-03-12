import { Inject } from "typescript-ioc";
import { Subscription } from "rxjs/Subscription";
import { ILogHandler, ILogService, ILogMessage } from "./interfaces";
import { IConfigService } from "../config/interfaces";

import * as path from 'path'
import * as fs from 'fs'

export class LogHandler extends ILogHandler {
  private _logService: ILogService;
  private _configService: IConfigService;
  private _messageSubscription: Subscription;

  private _loglevel: number = 3;
  private _logPath: string;
  private _logFile: fs.WriteStream;

  constructor(
    @Inject logService: ILogService,
    @Inject configService: IConfigService) {
    super();
    this._logService = logService;
    this._configService = configService;
  }

  public async start(): Promise<boolean> {
    try {
      let loglevel = this._configService.getValue("log-level");
      if(loglevel) {
        let level = this.getLogLevel(loglevel);
        if(level > 0) {
          this._loglevel = level;
        }
      }
      let dataPath = this._configService.getDataPath();
      if (fs.existsSync(dataPath)) {
        this._logPath = path.join(dataPath, `marker.log.json`);
        this._logFile = fs.createWriteStream(this._logPath, { flags: 'a', encoding: 'utf8' });
      }
      if (!this._messageSubscription) {
        for (var i = 0; i < this._logService.history.length; i++) {
          var message = this._logService.history[i];
          this.onmessage(message);
        }
        this._messageSubscription = this._logService.messages.subscribe(
          msg => this.onmessage(msg),
          err => this.onerror(err),
          () => this.ondone());
      }
      return true;
    }
    catch (e) {
      return false;
    }
  }

  public async stop(): Promise<boolean> {
    try {
      if (this._messageSubscription) {
        this._messageSubscription.unsubscribe();
        this._messageSubscription = null;
      }
      if (this._logFile) {
        this._logFile.end();
        this._logFile.close();
        this._logFile = null;
      }
      return true;
    }
    catch (e) {
      return false;
    }
  }

  private onmessage(message: ILogMessage) {
    try {
      let level = this.getLogLevel(message.type);
      if(level >= this._loglevel) {
        var text = JSON.stringify(message);
        if (this._logFile) {
          this._logFile.write(text);
        }
        if (console && console.debug) {
          console.debug(text);
        }
      }
    }
    catch (e) {
    }
  }

  private onerror(e: any) {
    if (console && console.debug) {
      console.debug("error detected in the log handler", e);
    }
  }

  private ondone() {
  }

  private getLogLevel(level: string) {
    if(level === "debug") {
      return 1;
    }
    if(level === "info") {
      return 2;
    }
    if(level === "warning") {
      return 3;
    }
    if(level === "error") {
      return 4;
    }
    return 0;
  }
}