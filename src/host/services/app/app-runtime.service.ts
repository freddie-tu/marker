import { IAppRuntimeService } from "./interfaces";
import { Inject } from "typescript-ioc";
import { ILogService, ILogHandler } from "../log/interfaces";
import { IConfigService } from "../config/interfaces";
import { IConverterService } from "../converter/interfaces";

export class AppRuntimeService extends IAppRuntimeService {
  private _logService: ILogService;
  private _logHandler: ILogHandler;
  private _configService: IConfigService;
  private _converterService: IConverterService;
    
  constructor(
    @Inject logService: ILogService,
    @Inject logHandler: ILogHandler,
    @Inject configService: IConfigService,
    @Inject converterService: IConverterService) {
    super();
    this._logHandler = logHandler;
    this._logService = logService;
    this._configService = configService;
    this._converterService = converterService;
  }

  public init(): void {   
    this.log.debug("initializing", "AppRuntimeService.init");
    this._configService.init();
    this._logHandler.start();
    this._converterService.init();
  }

  public quit(): void {  
    this._configService.save();
    this._logHandler.stop();
    this._converterService.done();
  }

  private get log(): ILogService {
    return this._logService;
  }
} 