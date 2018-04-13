<template>
  <div class="view-wrapper">
    <div class="view-left is-hidden-mobile">
      <div class="view-filelist is-unselectable" style="overflow:auto;">
        <div v-for="folder in folders" :key="folder.name" class="view-fileitem" >
          <div @click="onSwitchShowFolder(folder.name)">
            <span v-if="folder.name != ''" class="icon">
              <i :class="{'fa fa-chevron-down': folder.showcontents, 'fa fa-chevron-right': !folder.showcontents}"></i>
            </span>
            <span v-if="folder.name != ''" class="icon">
              <i class="fa fa-folder"></i>
            </span>
            <span v-if="folder.name != ''" class="filename">
              {{folder.name}}
            </span>
            </div>
        <div v-if="folder.showcontents" v-for="file in folder.files" :key="file.id"
          class="view-fileitem" 
          :class="{'is-selected': file === selected}"
          @click="onSelectFile(file.id)" :style="{ 'margin-left': file.depth + 'px'}">
            <span class="icon" :class="{'has-text-info': file.modified}">
              <i :class="{
                'fa fa-file-text':file.extension == '.md', 
                'fa fa-file-picture-o':file.extension == '.png'||file.extension == '.jpg'||file.extension == '.jpeg'||file.extension == '.bmp'||file.extension == '.gif', 
                'fa fa-file-excel-o':file.extension == '.xlsx', 
                
                'fa fa-file':file.extension != '.xlsx'&&file.extension != '.png'&&file.extension != '.jpg'&&file.extension != '.jpeg'&&file.extension != '.bmp'&&file.extension != '.gif'&&file.extension != '.md'}"></i>
            </span>
            <span class="filename" :class="{'has-text-info': file.modified}">
              {{file.name}}
            </span>
            </div>
        </div>
      </div>
    </div>
    <div class="view-right">
      <htmlview mode="view" :html="selected ? selected.data.html : null"></htmlview>
    </div>    
  </div>
</template>

<script>
import HtmlView from '../../components/html/HtmlView'
export default {
  data() {
    return {
      subscriptions: [],
      project: {},
      files: [],
      folders: [],
      selected: null
    };
  },
  created() {
    const changed = this.$project.changed;
    let subscription = changed.subscribe(value => {
      if(value) {
        this.update();
      } else {
        this.$router.replace("/home");
      }
    });
    this.subscriptions.push(subscription);
  },
  beforeDestroy() {
    this.subscriptions.forEach(function(subscription) {
      subscription.unsubscribe();
    }, this);
  },
  methods: {
    onSelectFile(id) {
      if(this.selected && this.selected.id === id) {
        return;
      }
      let file = this.files.find(f => f.id === id);
      if(!file) {
        return;
      }
      if(file.data.hash < 0)  {
        this.updateHtml(file);
      }      
      this.$project.setSelected(id);
    },
    onSwitchShowFolder(folderName) {
      try {
        let folder = this.folders.find(fo => fo.name == folderName);
        folder.showcontents = !folder.showcontents;
      }
      catch(e) {
        this.$log.error("error switching show folder", "onSwitchShowFolder", e);
      }
    },
    update() {     
      let pi = this.$project.getProjectInfo();
      if(pi) {        
        if(pi.uid === this.project.uid) {
          this.updateCurrentProject(pi);
        } else {
          this.updateNewProject(pi);          
        }              
      }
    },
    updateCurrentProject(pi) {      
      try {
        this.updateProject(pi);
      }
      catch(e) {
        this.$log.error("error updating the project", "updateCurrentProject", e);
      }
    },
    updateNewProject(pi) {
      try {
        this.updateProject(pi);
      }
      catch(e) {
        this.$log.error("error updating to new project", "updateNewProject", e);
      }
    },
    updateProject(pi) {
      try {
        if(pi.files) {  
        let project = {
          uid: pi.uid,
          folder: pi.folder
        };
          let files = [];
          let folders = [];
          let pifiles = pi.files.sort((a,b)=> {
            return (a.folder.localeCompare(b.folder) * 1000000) + 
            a.name.localeCompare(b.name);
          });
          pifiles.forEach(f => {
            let d = f.folder.split("/").length;
            if(f.folder == "")d = 0;
            let file = {
              id: f.id,
              name: f.displayname,
              folder: f.folder,
              depth: d * 10 + 30,
              extension: f.extension,
              modified: f.modified,
              data: {
                hash: -1,
                html: null
              }
            };
            if(f.hash) {
              let current = this.files.find(cf => cf.id === file.id);
              if(current && current.data.hash === f.hash.current) {
                file.data = current.data;
              }
            }
            if(folders.findIndex(fo => fo.name == f.folder) == -1)
            {
              let folder = {
                name: f.folder,
                showcontents: true,
                files: []
              };
              folder.files.push(file);
              folders.push(folder);
            }else{
              let folder = folders.find(fo => fo.name == f.folder);
              folder.files.push(file);
            }
            if(f.hash) {
              let current = this.files.find(cf => cf.id === file.id);
              if(current && current.data.hash === f.hash.current) {
                file.data = current.data;
              }
            }
            files.push(file);
          });

          let selected = null;
          if(pi.selected) {
            selected = files.find(f => f.id === pi.selected);
          } 
          if(!selected && files.length > 0) {
            selected = files[0];          
          }  
          if(selected) {
            if(!this.updateHtml(selected)) {
              selected.data = {
                hash: -2,
                html: "<p>error updating the html</p>"
              }                
            }
          }

          this.project = project;
          this.selected = selected,
          this.files = files;     
          this.folders = folders;     

          if(selected && selected.id != pi.selected) {
            this.$project.setSelected(selected.id);
          } 
        } else {
          this.selected = null,
          this.files = [];          
          this.folders = [];          
        }
      }
      catch(e) {
        this.$log.error("error updating the project", "updateProject", e);
      }
    },
    updateHtml(file) {
      try {
        if(file.extension == '.md')
        {
        let source = this.$project.getSource(file.id);
        if(source) {
          let data = {
            hash: source.hash,
            html: this.$converter.convert(file.folder, source.data)
          };
          file.data = data;
          return true;
        }
        }else if(file.extension == '.png'||file.extension == '.jpg'||file.extension == '.jpeg'||file.extension == '.bmp'||file.extension == '.gif'){
          let source = this.$project.getSource(file.id);
          let data = {
            hash: source.hash,
            html: '<IMG SRC='+this.$project.getBasepath()+'/'+file.folder+'/'+file.name+'>'
          }
          file.data = data;
          return true;
        }else{
          let source = this.$project.getSource(file.id);
          let data = {
            hash: source.hash,
            html: 'Unopenable file T_T'
          }
          file.data = data;
          return true;
        }
        return false;
      }
      catch(e) {            
        this.$log.warning("error updating the html", "updateHtml", e);   
        return false;         
      }
      
    }
  },
  components: {
    "htmlview": HtmlView
  }
}
</script>

<style scoped>
.view-wrapper {
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}
.view-left {
  display: flex;  
  flex: 1 1 auto;  
}
.view-right {  
  display: flex;  
  flex: 4 1 auto;  
}
.view-filelist {  
  width: 100%;
  border-radius: 0.2em;
  box-shadow: 0px 0px 5px rgb(75, 72, 72);
  background-color: rgba(0,0,0,0.5);
  color: whitesmoke;
  overflow: hidden;
  padding-top: 2em; 
  padding-left: 0.5em;
  padding-right: 0.75em;
}
.view-fileitem {
  cursor: pointer;
  padding: 0.25em;
  margin-bottom: 0.25em;
}
.view-fileitem.is-modified {
  color: white
}
.view-fileitem.is-selected {
  background-color: rgba(0,0,0,0.5);
}
.view-fileitem:hover {
  background-color: rgba(0,0,0,0.5);
}


</style>
