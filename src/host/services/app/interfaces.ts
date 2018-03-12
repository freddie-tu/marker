import { MainApp } from "../../main";

export abstract class IAppModuleService {
  abstract getMainApp(): MainApp;
}

export abstract class IAppRuntimeService {
  abstract init(): void;
  abstract quit(): void;
}

export abstract class IWindowService {
  abstract createMainWindow(): Electron.BrowserWindow;
}