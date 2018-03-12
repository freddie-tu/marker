import { ILogMessage, ILogService } from './interfaces';
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";

export class LogService extends ILogService {
  private _history: ILogMessage[] = [];
  private _messages: Subject<ILogMessage> = new Subject<ILogMessage>();

  constructor() {
    super();
  }

  public init() {        
  }

  public get messages(): Observable<ILogMessage> {
    return this._messages.asObservable();
  }

  public get history(): ILogMessage[] {
    return this._history;
  }

  public debug(message: string, source?: string, detail?: string | object) {  
    if (detail) {
      var detailInfo: string;
      if (detail instanceof Object) {
          detailInfo = JSON.stringify(detail);
      } else {
          detailInfo = detail;
      }
      this.log('debug', message, source, detailInfo);
    } else {
      this.log('debug', message, source, null);
    }    
  }

  public info(message: string, source?: string, detail?: string | object) { 
    if (detail) {
      var detailInfo: string;
      if (detail instanceof Object) {
          detailInfo = JSON.stringify(detail);
      } else {
          detailInfo = detail;
      }
      this.log('info', message, source, detailInfo);
    } else {
      this.log('info', message, source, null);
    }        
  }

  public warning(message: string, source?: string, detail?: string | object) {   
    if (detail) {
      var detailInfo: string;
      if (detail instanceof Object) {
          detailInfo = JSON.stringify(detail);
      } else {
          detailInfo = detail;
      }
      this.log('warning', message, source, detailInfo);
    } else {
      this.log('warning', message, source, null);
    }         
  }

  public error(message: string, source?: string, detail?: string | Error) { 
    if (detail) {
      var detailInfo: string;
      if (detail instanceof Error) {
          var error = {
              message: detail.message,
              stack: detail.stack
          }
          detailInfo = JSON.stringify(error);
      } else {
          detailInfo = detail;
      }
      this.log('error', message, source, detailInfo);
    }
    else {
        this.log('error', message, source, null);
    }     
  }

  public message(message: ILogMessage) : void {
    this.handleMessage(message);
  }
  
  private log(type: string, message: string, source?: string, details?: string) {
    let msg: ILogMessage = {
      type: type,
      message: message,
      source: source,
      details: details,
      origin: "host",
      timestamp: Date.now()
    };
    this.handleMessage(msg);
  }

  private handleMessage(message: ILogMessage) {
    while (this._history.length >= 100) {
      this._history.shift();
    }
    this._history.push(message);
    this._messages.next(message);
  }
} 