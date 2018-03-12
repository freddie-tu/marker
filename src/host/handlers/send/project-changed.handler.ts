import { Inject } from "typescript-ioc";
import { Subscription } from 'rxjs/Subscription';

import { ILogService } from "../../services/log/interfaces";
import { IAppModuleService } from "../../services/app/interfaces";
import { IProjectChangedSendHandler } from "./interfaces";
import { IProjectService } from "../../services/project/interfaces";

export class ProjectChangedSendHandler extends IProjectChangedSendHandler {
  private _logService: ILogService;
  private _appService: IAppModuleService;
  private _projectService: IProjectService;
  private _subscription: Subscription;
  private _channel: string;
    
  constructor(
    @Inject logService: ILogService,
    @Inject appModuleService: IAppModuleService,
    @Inject projectService: IProjectService) {  
    super()
    this._logService = logService
    this._appService = appModuleService;
    this._projectService = projectService;
  }    

  public create(channel: string): void {
    this.log.debug("project changed handler create", "ProjectChangedSendHandler.create");
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
    this._channel = channel;
    this._subscription = this._projectService.changed.subscribe(
      change => this.execute(),
      err => this.onerror(err),
      () => this.ondone());
  }

  public destroy(): void {
    this.log.debug("destroy", "ConnectionChangedSendHandlerImpl");
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }    
  }

  public execute(): void {
    this.log.debug("executing project changed", "ProjectChangedSendHandler.execute", { });
    var mainApp = this._appService.getMainApp();
    if (mainApp && mainApp.mainWindow && mainApp.mainWindow.webContents) {
      var webContents = mainApp.mainWindow.webContents;
      webContents.send(this._channel, true);
    }
  }

  private onerror(e: any) {
    this.log.error("project change error", "ProjectChangedSendHandler.onerror", e);
    this.create(this._channel);
  }

  private ondone() {
    this.log.warning("project change done", "ProjectChangedSendHandler.onerror");
    this.destroy();
  }

  private get log(): ILogService {
    return this._logService;
  }
}