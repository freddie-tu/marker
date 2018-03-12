export abstract class IReceiveHandler {
  public abstract execute(event: any, arg: any): void;
}

export abstract class ILogClientMessageReceiveHandler extends IReceiveHandler {    
}

export abstract class IReadProjectInfoReceiveHandler extends IReceiveHandler {    
}

export abstract class IProjectCommandReceiveHandler extends IReceiveHandler {
}

export abstract class IConvertCommandReceiveHandler extends IReceiveHandler {
}
