import { Inject } from "typescript-ioc";
import { Subscription } from 'rxjs/Subscription';

import * as marked from "marked";
import * as katex from "katex";
import * as url from 'url';
import * as path from 'path';

import { ILogService } from "../log/interfaces";
import { IConverterService } from "./interfaces";
import { IProjectService } from "../project/interfaces";

export class ConverterService extends IConverterService {  
  private _logService: ILogService;
  private _projectService: IProjectService;
  private _subscription: Subscription;
  private _projectFolder: string;

  constructor( 
    @Inject logService: ILogService,
    @Inject projectService: IProjectService) {
    super();
    this._logService = logService;   
    this._projectService = projectService;  
  }

  public init(): void {
    this.log.debug("initializing", "ConverterService.init");
    try {
      const projectService = this._projectService;
      this._subscription = projectService.changed.subscribe(value => {
        let folder = null;
        if(value) {
          const projectInfo = projectService.getProjectInfo();
          if(projectInfo && projectInfo.folder) {
            folder = projectInfo.folder;
          }
        }
        this._projectFolder = folder;
      });
    }     
    catch(e) {
      this.log.error("error initializing", "ConverterService.init", e);
      throw e;
    }
  }

  public done(): void {    
    this.log.debug("done", "ConverterService.done");
    try {
      if(this._subscription) {
        this._subscription.unsubscribe();
        this._subscription = null;
        this._projectFolder = null;
      }
    } 
    catch(e) {     
      this.log.error("done", "ConverterService.done", e); 
    }
  }
  
  convert(folder:string, src: string): string {
    this.log.debug("convert", "ConverterService.convert");
    try {
      const md = this.convertKatex(src);
      const html = this.convertMarkdown(folder,md);
      return html;
    }
    catch (e) {
      this.log.error("error convert", "ConverterService.convert", e);
    }
  }  

  private convertKatex(src: string) : string {    
    this.log.debug("converting katex", "ConverterService.convertKatex");
    try {
      let res, reg = new RegExp(/\n?\$\$[ \n]?([\s\S]+?)[ \n]?\$\$\n?/m);
      while ((res = reg.exec(src)) !== null) {
        try {
          src = src.replace(res[0], katex.renderToString(res[1]));
        }
        catch(e) {
          src = src.replace(res[0], "<div>invalid katex:" + e + "</div>");
          this.log.warning("invalid katex", "convertKatex", res[1]);
        }
      }
      return src;
    }
    catch(e) {
      this.log.error("error converting katex", "ConverterService.convertKatex", e);
      return src;
    }
  }

  private convertMarkdown(folder: string, src: string) : string {
    this.log.debug("converting markdown", "ConverterService.convertMarkdown");
    try {
      let renderer: any = new marked.Renderer();
      let that = this;

      let curFolder : string = that._projectFolder+"/"+folder;
      //rennder anchors
      const f_heading  = renderer.heading;  
      renderer.heading  = function (text: string, level: number, raw: string) {
        //todo
        return f_heading.apply(this, [text, level, raw]);
      }

      const f_link = renderer.link;
      renderer.link = function(href: string, title: string, text: string) {
        const linkUrl = url.parse(href);
        if(linkUrl && !linkUrl.protocol && curFolder) {
          let sublink = linkUrl.path;
          let link = path.join(folder, sublink);
          //A bit of magic to placate the Javascript gods.
          link = link.replace(/\\/g, "/");
          href = `javascript:onclick('${link}')`;
        }
        return f_link.apply(this, [href, title, text]);
      }

      //render local images      
      const f_image = renderer.image;  
      renderer.image = function (href: string, title: string, text: string) {
        const imageUrl = url.parse(href);
        if(imageUrl && !imageUrl.protocol && curFolder) {
          const fullpath = path.join(curFolder, imageUrl.path);
          const fileUri = that.getFileUri(fullpath);
          if(title) {
            return `<img src="${fileUri}" title="${title}" alt="${text}">`;
          } else {
            return `<img src="${fileUri}" alt="${text}">`;
          }
        } else {
          return f_image.apply(this, [href, title, text]);
        }
      };

      //convert
      return marked(src, {renderer:renderer});     
    }
    catch(e) {
      this.log.error("error converting markdown", "ConverterService.convertMarkdown", e);
      throw e;
    }
  }

  private getFileUri(filepath: string) {
    filepath = path.resolve(filepath);
    if (path.sep === '\\') {
      filepath = filepath.split(path.sep).join('/');
    }
    if (!/^file:\/\//g.test(filepath)) {
      filepath = 'file:///' + filepath;
    }
    return filepath;
  }

  private get log(): ILogService { 
    return this._logService;
  } 
}