import { Inject } from "typescript-ioc";

import { ILogService } from "../../services/log/interfaces";
import { IConverterService } from "../../services/converter/interfaces";
import { IConvertCommandReceiveHandler } from "./interfaces";

export class ConvertCommandReceiveHandler extends IConvertCommandReceiveHandler {
  private _logService: ILogService;
  private _converterService: IConverterService;

  constructor(
    @Inject logService: ILogService,
    @Inject converterService: IConverterService) {
    super();
    this._logService = logService;
    this._converterService = converterService;
  } 

  public execute(event: any, arg: any): void { 
    this.log.debug("received convert command", "ConvertCommandReceiveHandler.execute", arg);
    try {
      let command: string = arg.command;
      if(command === "convert") {
        let source: string = arg.source;
        let folder: string = arg.folder;
        let result = this._converterService.convert(folder,source);
        event.returnValue = result;
      }            
    }
    catch(e) {
      this.log.error("error receiving convert command", "ConvertCommandReceiveHandler.execute", e);      
    } 
    event.returnValue = null;
  }

  private get log(): ILogService {
    return this._logService;
  }
}