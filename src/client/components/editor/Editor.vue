<template>
    <div id='app-editor'>{{value}}</div>
</template>

<script>
import * as brace from "brace";

const modelist = ['markdown', 'html']
const themelist = ['ambiance', 'monokai', 'chrome', 'github']

function parseBool(str) {
  if (str.length == null) {
    return str == 1 ? true : false;
  } else {
    return str == "true" ? true : false;
  }
}

export default {
  model: {
    prop: "value",
    event: "change"
  },
  props: {
    value: String,
    mode: {
      type: String,
      default: 'markdown',
      validator: (val) => modelist.findIndex((mode) => mode === val) > -1
    },
    theme: {
      type: String,
      default: 'chrome',
      validator: (val) => themelist.findIndex((theme) => theme === val) > -1
    },
    fontsize: {
      type: String,
      default: '14px',
      validator: (val) => parseInt(val) > 11 && parseInt(val) < 25
    },
    readonly: {
      type: String,
      default: "false"
    },
  },
  data() {
    return {
      editor: null
    }
  },
  mounted () {
    this.editor = brace.edit('app-editor')
    this.editor.$blockScrolling = Infinity
    
    require('brace/ext/spellcheck');
    require('brace/ext/searchbox')

    this.editor.setOptions({
      enableMultiselect: true,
      highlightActiveLine: false,
      spellcheck: true,
      wrap: true,
      showFoldWidgets: false,
      showPrintMargin: false
    });

    let that = this;
    this.editor.commands.addCommand({
      name: 'save file',
      bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
      exec: function (editor) {
        that.$emit("save");
      }
    })

    this.editor.commands.addCommand({
      name: 'sync view',
      bindKey: {win: 'Ctrl-Space'},
      exec: function (editor) {
        const pos = editor.getCursorPosition();
        const document = editor.session.getDocument();
        const lines = document.getAllLines();
        const regex = new RegExp('^#+ ', 'i');
        let index = -1;
        for(let i = pos.row; i >= 0; i--) {
          if(regex.test(lines[i])) {
            index = i;
            break;
          }
        }
        if(index >= 0) {
          const line = lines[index];
          let hashcount = 0;
          while(line[hashcount] === '#') {
            hashcount++;
          }
          let matchcount = 0;
          const regexhash = new RegExp(`^#{${hashcount}} `, 'i');
          for(let i = index; i >= 0; i--) {
            if(regexhash.test(lines[i])) {
              matchcount++;
            }
          }
          //console.log("hashcount", hashcount);
          //console.log("matchcount", matchcount);
          that.$emit("sync", {
            tag: "h"+ hashcount,
            index: matchcount - 1
          });
        }



        //find the curson pos;
        //for i = 0 to 10
        // look for h(x) tag down and up
        // if found count h(x) tag
        // document.getElementsByTagName('h2')[3].scrollIntoView();	  
      }
    })
  
    this.editor.setReadOnly(parseBool(this.readonly));
    this.editor.setFontSize(this.fontsize);
    
    this.setMode();
    this.setTheme();

    const session = this.editor.getSession();
    if(session) {
      session.on('change', this.onChange)    
    }    
  },
  watch: {
    value(value) {
      if(value != this.editor.getValue()) {
        this.editor.setValue(value, 1);
      }
    },
    mode () {
      this.setMode()
    },
    theme () {
      this.setTheme()
    },
    fontsize (newVal) {      
      console.log("fontsize", newVal);
      this.editor.setFontSize(newVal)
    },
    readonly(newVal) {
      console.log("readonly", newVal);
      this.editor.setReadOnly(newVal)
    }
  },
  methods: {    
    setMode () {           
      require('brace/mode/' + this.mode)      
      this.editor.getSession().setMode('ace/mode/' + this.mode)      
    },
    setTheme () {
      require('brace/theme/' + this.theme)
      this.editor.setTheme('ace/theme/' + this.theme);
    }, 
    setAnnotations(annotations) {
      const session = this.editor.getSession();
      if(session) {         
        session.setAnnotations(annotations);
      }
    },     
    onChange() {
      this.$emit("change", this.editor.getValue());
    }
  }
}
</script>

<style scoped> 
#app-editor {
  height: 100%;
}
</style>