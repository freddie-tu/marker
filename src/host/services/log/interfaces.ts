import { Observable } from "rxjs/Observable";

export interface ILogMessage {
  type: string;
  message: string;
  source?: string;
  details?: string;
  origin?: string;
  timestamp: number;  
}

export abstract class ILogService {  
  abstract get history(): ILogMessage[];
  abstract get messages(): Observable<ILogMessage>;

  abstract debug(message: string, source?: string, detail?: string | object) : void;
  abstract info(message: string, source?: string, detail?: string | object) : void;
  abstract warning(message: string, source?: string, detail?: string | object) : void;
  abstract error(message: string, source?: string, detail?: string | Error) : void;
  abstract message(message: ILogMessage) : void;
}

export abstract class ILogHandler {  
  abstract start(): Promise<boolean>; 
  abstract stop(): Promise<boolean>;   
}