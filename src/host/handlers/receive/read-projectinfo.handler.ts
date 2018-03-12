import { Inject } from "typescript-ioc";
import { ILogService } from "../../services/log/interfaces";
import { IProjectService } from "../../services/project/interfaces";
import { IReadProjectInfoReceiveHandler } from "./interfaces";

export class ReadProjectInfoReceiveHandler extends IReadProjectInfoReceiveHandler {
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
    this.log.debug("reading project info", "ReadProjectInfoReceiveHandler.execute");
    try {
      let projectInfo = this._projectService.getProjectInfo();
      event.returnValue = projectInfo;
    } 
    catch(e) {
      this.log.debug("error reading project info", "ReadProjectInfoReceiveHandler.execute", e);
      event.returnValue = null;
    }      
  }

  private get log(): ILogService {
    return this._logService;
  }
}