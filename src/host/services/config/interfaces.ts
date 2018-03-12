import { Observable } from "rxjs/Observable";

export abstract class IConfigService {
  abstract get changed(): Observable<boolean>;
 
  abstract getValue(key: string): any;
  abstract setValue(key: string, value: any): boolean;

  abstract getDataPath(): string;

  abstract init(): void;
  abstract getConfigData() : object;
  abstract setConfigData(data: object): void;    
  abstract save(): boolean;
}