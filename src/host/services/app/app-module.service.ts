import { IAppModuleService } from "./interfaces";
import { MainApp } from "../../main";

export class AppModuleService extends IAppModuleService {
  private _mainApp: MainApp;

  constructor(mainApp: MainApp) {
    super();
    this._mainApp = mainApp;
  }

  public getMainApp(): MainApp {
    return this._mainApp;
  }
}