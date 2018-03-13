<template>
  <div class="edit-wrapper">
    <div class="edit-left">
      <md-editor mode="markdown" theme="ambiance" v-model="source.data" @change="sourcechange$.next($event)" @save="onsave" @sync="onsync($event)"></md-editor>
    </div>
    <div class="app-edit-middle is-hidden-mobile">
      <div class="divider"></div>
    </div>
    <div class="edit-right is-hidden-mobile">
      <htmlview ref="htmlview" :html="html"></htmlview>
    </div>
  </div>
</template>

<script>
import HtmlView from '../../components/html/HtmlView'
import MdEditor from "../../components/editor/Editor"

import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/map";

import * as marked from "marked";

export default {
  data() {
    return {
      subscriptions: [],
      sourcechange$: null,
      project: null,
      selected: null,
      source: {
        hash: -1,
        data: null,
      },
      html: null
    }
  },
  created() {
    const projectchanged = this.$project.changed;
    let projectchangedSubscription = projectchanged.subscribe(value => {
      if(value) {
        this.updateproject();
      } else {
        this.$router.replace("/home");
      }
    });
    this.subscriptions.push(projectchangedSubscription);

    this.sourcechange$ = new Subject();
    let sourcechangeSubscription = this.sourcechange$
      .debounceTime(200)
      .distinctUntilChanged()
      .subscribe((source) => {
        this.updatesource(source);
      });
    this.subscriptions.push(sourcechangeSubscription);
  },
  beforeDestroy() {
    this.subscriptions.forEach(function(subscription) {
      subscription.unsubscribe();
    }, this);
  },
  methods: {
    updatesource() {
      this.source.hash = this.$project.setSource(this.selected.id, this.source.data);
      this.html = this.$converter.convert(this.selected.folder, this.source.data);      
    },
    updateproject() {      
      let pi = this.$project.getProjectInfo();
      if(pi && pi.files && pi.files.length > 0) { 

        let selected = null;
        if(pi.selected) {
          selected = pi.files.find(f => f.id === pi.selected);
        } 
        if(!selected && pi.files.length > 0) {
          selected = pi.files[0];          
        }    
        if(!selected) {
          this.$router.replace("/home");  
        }

        let source = this.$project.getSource(selected.id);
        if(!source) {
          this.$router.replace("/home");  
        }

        this.project = pi;
        this.selected = selected;
        this.source = source;        
        this.html = this.$converter.convert(selected.folder, source.data);  
        
        if(selected.id != pi.selected) {
          this.$project.setSelected(selected.id);
        } 
      } else {
        this.$router.replace("/home");
      }
    },
    onsave() {
      this.$project.saveCurrent();
    },
    onsync(e) {
      this.$refs.htmlview.scrolltoTag(e.tag, e.index);
    }
  },
  components: {
    "md-editor": MdEditor,
    "htmlview": HtmlView
  }
}
</script>

<style scoped>
.edit-wrapper {
  display: flex;
  flex-direction: row;
  height: 100%;
}
.edit-left {   
  flex: 1 100%;
}
.edit-right {
  display: flex;  
  flex:1 100%;  

}
</style>
