import { Inject } from "typescript-ioc";

import { IAppModuleService } from "../../services/app/interfaces";
import { ILogService } from "../../services/log/interfaces";
import { INavigationRequestSendHandler } from "./interfaces";


export class NavigationRequestSendHandler extends INavigationRequestSendHandler {
  private _logService: ILogService;
  private _appService: IAppModuleService;
  private _channel: string;

  constructor(
    @Inject logService: ILogService,
    @Inject appModuleService: IAppModuleService) {
 
    super()

    this._logService = logService
    this._appService = appModuleService;
  }

  public create(channel: string): void {
    this._channel = channel;
  }

  public destroy(): void {
  }

  public execute(path: string): void {
    this.log.debug("navigating", "NavigationRequestSendHandler.execute", { path: path});
    var mainApp = this._appService.getMainApp();
    if (mainApp && mainApp.mainWindow && mainApp.mainWindow.webContents) {
      var webContents = mainApp.mainWindow.webContents;
      webContents.send(this._channel, path);
    }
  }

  private get log(): ILogService {
    return this._logService;
  }
}