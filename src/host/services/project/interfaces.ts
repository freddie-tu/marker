import { Observable } from "rxjs/Observable";

export interface IProjectInfo {
  uid: number,
  folder: string;
  selected?: string,
  files: {
    id: string;
    name: string,
    folder: string,
    modified: boolean;
    hash?: {
      file: number,
      current: number,
    }
  }[];
}

export abstract class IProjectService {
  abstract get changed(): Observable<boolean>;

  abstract getProjectInfo(): IProjectInfo;
  abstract setSelected(id: string): boolean;
  abstract getFileSource(fileid: string): { hash: number, data: string }
  abstract setFileSource(fileid: string, source: string): number;
  abstract saveFile(fileid: string) : void;
  abstract saveAll(): void;
  abstract close(): void;

  abstract loadFromFile(filename: string): void;
  abstract loadFromFolder(folder: string): void;
}
