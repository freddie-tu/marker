import { protocol } from 'electron'

import { Inject } from "typescript-ioc";
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import "rxjs/add/observable/timer";

import * as path from 'path'
import * as fs from 'fs'

import { ILogService } from "../log/interfaces";
import { IProjectService, IProjectInfo } from "./interfaces";


interface ProjectData {
  uid: number,
  folder: string;
  selected?: string;
  files: {
    id: string;
    name: string;
    folder: string;
    modified: boolean;
    source?: string;
    hash?: {
      file: number,
      current: number
    };
  }[];
};

export class ProjectService extends IProjectService {
  private monitor: Subscription;
  private _logService: ILogService;
  //private _statsSubscription: Observable;
  private _changed: Subject<boolean> = new Subject<boolean>();
  private _data: ProjectData = null;

  constructor(
    @Inject logService: ILogService) {
    super();
    this._logService = logService;
    this.initProject();
    this.initProtocol();
  }

  public get changed(): Observable<boolean> {
    return this._changed.asObservable();
  }

  public getProjectInfo(): IProjectInfo {
    this.log.debug("getting the project info", "ProjectService.getProjectInfo");
    try {
      let projectinfo: IProjectInfo = null;
      if (this._data) {
        projectinfo = {
          folder: this._data.folder,
          uid: this._data.uid,
          selected: this._data.selected,
          files: this._data.files ? this._data.files.map((f) => {
            return {
              id: f.id,
              name: f.name,
              folder: f.folder,
              modified: f.modified,
              hash: f.hash ? f.hash: undefined
            }
          }) : []
        }
      }         
      return projectinfo;        
    }
    catch (e) {
      this.log.error("error getting the project info", "ProjectService.getProjectInfo", e);
    }
    return null;
  }

  public setSelected(id: string): boolean {
    this.log.debug("setting the selected file", "ProjectService.setSelected", { id: id });
    try {
      if(!this._data) {
        return false;
      }
      if(this._data.selected === id) {
        return true;
      }
      var selected = this._data.files.find(f => f.id === id);
      if(selected == null) {
        return false;
      }
      this._data.selected = selected.id;
      this._changed.next(true);
    } 
    catch(e) {
      this.log.error("error setting the selected file", "ProjectService.setSelected", e);
    }
  }

  public getFileSource(fileid: string) : {hash: number, data: string} {
    this.log.debug("geting the file source", "ProjectService.getFileSource", { id: fileid });
    try {
      if(!this._data) {
        throw new Error("no project loaded");
      }
      let file = this._data.files.find(f => f.id === fileid);
      if(!file) {
        throw new Error("project file is unknown");
      }
      if(file.source) {
        return {
          hash: file.hash.current, 
          data: file.source
        }
      }

      let filePath = path.join(this._data.folder, file.name);      
      let fd = fs.openSync(filePath, 'r');
      if(!fd) {
        throw new Error("could not open the project file");
      }
      var source = fs.readFileSync(fd, 'utf8');
      fs.closeSync(fd); 
      file.source = source;

      let hash = this.hash(source);
      file.hash = {
        file: hash,
        current: hash,
      };
      return {
        hash: file.hash.current, 
        data: file.source
      }
    }
    catch(e) {
      this.log.error("error geting the file source", "ProjectService.getFileSource", e);
    }
  }

  public setFileSource(fileid: string, source: string): number {
    this.log.debug("setting the file source", "ProjectService.setFileSource", { id: fileid });
    try {
      if(!this._data) {
        throw new Error("no project loaded");
      }
      let file = this._data.files.find(f => f.id === fileid);
      if(!file) {
        throw new Error("project file is unknown");
      }
      file.source = source;      
      if(file.hash) {
        file.hash.current = this.hash(source);
      } else {
        file.hash = {
          file: 0,
          current: this.hash(source)
        }
      }
      if(file.hash.file != file.hash.current) {
        if(file.modified === false) {
          file.modified = true;
          this._changed.next(true);
        }
      } else {
        if(file.modified === true) {
          file.modified = false;
          this._changed.next(true);
        }
      }
      return file.hash.current;
    }
    catch(e) {
      this.log.error("error seting the file source", "ProjectService.setFileSource", e);
    }
  }

  public saveFile(fileid: string) : void {
    this.log.debug("saving the file", "ProjectService.saveFile", { id: fileid });
    try {
      if(!this._data) {
        throw new Error("no project loaded");
      }
      let file = this._data.files.find(f => f.id === fileid);
      if(!file) {
        throw new Error("project file is unknown");
      }
      if(!file.source) {
        return;
      }

      let filePath = path.join(this._data.folder, file.name);      
      let fd = fs.openSync(filePath, 'w');
      if(!fd) {
        throw new Error("could not open the project file");
      }
      fs.writeFileSync(fd, file.source, 'utf8');
      fs.closeSync(fd);

      if(file.hash) {
        file.hash.file = file.hash.current;
      } else {
        let hash = this.hash(file.source);
        file.hash = {
          file: hash,
          current: hash
        }
      }
      if(file.modified !== false) {
        file.modified = false;
        this._changed.next(true);
      }
    }
    catch(e) {
      this.log.error("error saving the file", "ProjectService.saveFile", e);
    }
  }

  public saveAll() {
    this.log.debug("saving all files", "ProjectService.saveAll");
    try {
      if(!this._data) {
        throw new Error("no project loaded");
      }
      let hasModified = this.hasModifiedFiles();
      this._data.files.forEach(file => {
        if(file.source) {
          let filePath = path.join(this._data.folder, file.name);  
          let fd = fs.openSync(filePath, 'w');
          if(!fd) {
            throw new Error("could not open the project file");
          }
          fs.writeFileSync(fd, file.source, 'utf8');
          fs.closeSync(fd);    
          
          file.modified = false;
          if(file.hash) {
            file.hash.file = file.hash.current;
          } else {
            let hash = this.hash(file.source);
            file.hash = {
              file: hash,
              current: hash
            }
          }          
        }        
      });
      if(hasModified) {
        this._changed.next(true);
      }
    }
    catch(e) {
      this.log.error("error saving all files", "ProjectService.saveAll", e);
    }
  }

  public loadFromFile(filepath: string): void {
    this.log.debug("loading the project from file", "ProjectService.loadFromFile", { file: filepath });
    try {
      if (!fs.existsSync(filepath)) {
        throw new Error("The file could not be located");
      }

      let folder = path.dirname(filepath);
      let filename = path.basename(filepath);

      let data: ProjectData = {
        uid: this.hash("project://" + folder),
        folder: folder,
        files: []
      };
      data = this.recursiveLoadFromFolder(folder, "", data);

      var selected = data.files.find(f => f.name.toLocaleLowerCase() === filename.toLocaleLowerCase());
      if(selected != null) {
        data.selected = selected.id;
      }
      
      this._data = data;
      this._changed.next(true);
    }
    catch (e) {
      this.log.error("error loading the project from file", "ProjectService.loadFromFile", e);
    }
  }

private recursiveLoadFromFolder(folder: string, basefolder: string, data: ProjectData): ProjectData {
  var files = fs.readdirSync(folder);
  files.forEach(file => {
    let fn = "";
    if(basefolder === "")
    {
      fn = file;
    }else{
      fn = basefolder+"/"+file;
    }
    let isDirectory = fs.statSync(path.join(folder, file)).isDirectory();
    if(isDirectory)
    {
      data = this.recursiveLoadFromFolder(path.join(folder,file), fn, data);     
    }
    let ext = path.extname(file).toLowerCase();
    if(ext === ".md") {
      if(data.files.find(f => f.id === fn) == null)
      {
        data.files.push({
          id: fn,
          name: fn,
          folder: basefolder,
          modified: false    
        });
      } 
    }
  });
  return data;
}

  public loadFromFolder(folder: string): void {
    this.log.debug("loading the project from folder", "ProjectService.loadFromFolder", { folder: folder });
    try {
      if (!fs.existsSync(folder)) {
        throw new Error("The folder could not be located");
      }

      let data: ProjectData = {
        uid: this.hash("project://" + folder),
        folder: folder,
        files: []
      };
      data = this.recursiveLoadFromFolder(folder,"", data);
          
      this._data = data;
      this._changed.next(true);
    }
    catch (e) {
      this.log.error("error loading the project from folder", "ProjectService.loadFromFolder", e);
      this._changed.next(false);
    }
  }

  public close(): void {
    this.log.debug("closing project", "ProjectService.close");
    try {
      if(!this._data) {
        return;
      }
      this._data = null;
      this._changed.next(false);
    }
    catch(e) {
      this.log.error("error closing project", "ProjectService.close", e);
    }
  }

  private initProject() {
    this.log.debug("initializing the project", "ProjectService.initProject");
    try {
      this.monitor = Observable.timer(0, 1000).subscribe(t => this.monitorProject());

      if (process.argv.length >= 2) {
        var openFilePath = process.argv[1];
        if (!fs.existsSync(openFilePath)) {
          return;
        }
        this.loadFromFile(openFilePath);  
      }
    }
    catch(e) {
      this.log.error("error initializing the project", "ProjectService.initProject", e);
    }
  }

  private initProtocol() {
    this.log.debug("initializing the local protocol", "ProjectService.initProtocol");
    try {
      let project = this;
      protocol.registerFileProtocol('local', (request, callback) => {
        if(project._data) {    
          let url = "";
          if(request.url.startsWith("local://")) {
            url = request.url.substr(8);
          } 
          else {
            url = request.url.substr(6);
          }
          const filePath = path.normalize(`${project._data.folder}/${url}`);
          callback(filePath);
        } else {
          callback(request.url);
        }
      }, (error) => {
        if (error) console.error('Failed to register protocol')
      })
    }
    catch(e) {
      this.log.error("error initializing the local protocol", "ProjectService.initProtocol", e);
    }
  }

  private monitorProject() {
    try {
      if(!this._data) {
        return;        
      }
      let folder = this._data.folder;
      if(!fs.existsSync(folder)) {
        return;
      } 

      let projectChanged = false;
      let projectfiles = this._data.files;

      this._data = this.recursiveLoadFromFolder(folder, "", this._data);

      if(projectChanged) {
        this._changed.next(false);
      }
    }
    catch(e) {
      this.log.error("error while checkin the project", "ProjectService.initProtocol", e);
    }
  }

  private hasModifiedFiles(): boolean {
    if(!this._data) {
      return false;
    }
    var modified = this._data.files.find(f => f.modified === true);
    if(modified) {
      return true;
    }
    return false;
  } 

  private hash(data: string): number {
    let hash: number = 0, i : number, chr: number;
    if (data.length === 0) return hash;
    for (i = 0; i < data.length; i++) {
      chr   = data.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private get log(): ILogService { 
    return this._logService;
  }
}