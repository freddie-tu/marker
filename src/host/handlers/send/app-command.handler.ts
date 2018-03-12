import { Inject } from "typescript-ioc";

import { ILogService } from "../../services/log/interfaces";
import { IAppModuleService } from "../../services/app/interfaces";
import { IAppCommandSendHandler } from "./interfaces";

export class AppCommandSendHandler extends IAppCommandSendHandler {
  private _logService: ILogService;
  private _appService: IAppModuleService;
  private _channel: string;  

  constructor(
    @Inject logService: ILogService,
    @Inject appModuleService: IAppModuleService) {        
    super();
    this._logService = logService
    this._appService = appModuleService;
  }

  public create(channel: string): void {
    this.log.debug("appcommand handler create", "AppCommandSendHandler.create");
    this._channel = channel;
  }

  public destroy(): void {
  }

  public execute(command: object): void {
    this.log.debug("executing appcommand", "AppCommandSendHandler.execute", command);
    var mainApp = this._appService.getMainApp();
    if (mainApp && mainApp.mainWindow && mainApp.mainWindow.webContents) {
      var webContents = mainApp.mainWindow.webContents;
      webContents.send(this._channel, command);
    }
  }

  private get log(): ILogService {
    return this._logService;
  }
}