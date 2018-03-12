import { Inject } from "typescript-ioc";

import { ILogService, ILogMessage } from "../../services/log/interfaces";
import { ILogClientMessageReceiveHandler } from "./interfaces";

export class LogClientMessageReceiveHandler extends ILogClientMessageReceiveHandler {
  private _logService: ILogService;

  constructor(
    @Inject logService: ILogService) {

    super();

    this._logService = logService;
  }

  public execute(event: any, arg: any): void {
    try {
      var msg = <ILogMessage>arg;
      let message: ILogMessage = {
        type: msg.type,
        message: msg.message,
        source: msg.source,
        details: msg.details,
        origin: "client",
        timestamp: msg.timestamp
      };
      this._logService.message(message);
    }
    catch (e) {
      this._logService.error("error in client log message", "LogClientMessageReceiveHandlerImpl", e);
    }
  }
}