export abstract class ISendHandler {
  public abstract create(channel: string) : void;
  public abstract destroy() : void;    
}

export abstract class INavigationRequestSendHandler extends ISendHandler {
  public abstract execute(path: string): void;
}

export abstract class IProjectChangedSendHandler extends ISendHandler {
  public abstract execute(): void;
}

export abstract class IAppCommandSendHandler extends ISendHandler {
  public abstract execute(command: object): void;
}

