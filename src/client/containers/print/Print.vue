<template>
  <div class="print-wapper">
    <div class="print-wapper-left is-unselectable">   
      <div class="print-section">
        <div class="file-section">
          <label class="label">document</label>
          <div class="printer-options">
            <div class="field is-horizontal">
              <div class="field-label">
                <label class="label">print</label>
              </div>
              <div class="field-body">
                <div class="field is-expanded">
                  <div class="control">
                    <div class="select is-fullwidth">
                      <select name="document-print" v-model="fileprint">
                        <option value="current">current page</option>
                        <option value="all">all files</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="printer-section">
          <label class="label">printer</label>
          <div class="field is-horizontal">
            <div class="field-label">
              <label class="label">print to</label>
            </div>
            <div class="field-body">
              <div class="field is-narrow">
                <div class="control">
                  <label class="radio">
                    <input type="radio" name="printto" value="pdf" v-model="printto">
                    Pdf
                  </label>
                  <label class="radio">
                    <input type="radio" name="printto" value="printer" v-model="printto">
                    Printer
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="field is-horizontal" v-if="printto === 'printer'">
            <div class="field-label">
              <label class="label">printer</label>
            </div>
            <div class="field-body">
              <div class="field is-expanded">
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="printer">
                      <option>default</option>
                      <option v-for="printer in printers" :key="printer.name">{{printer.name}}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="field is-horizontal" v-if="printto === 'printer'">
            <div class="field-label">
              <label class="label">silent</label>
            </div>
            <div class="field-body">
              <div class="field is-narrow">
                <div class="control">
                  <label class="radio">
                    <input type="radio" name="printsilent" value="yes" v-model="printsilent">
                    Yes
                  </label>
                  <label class="radio">
                    <input type="radio" name="printsilent" value="no" v-model="printsilent">
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>          
          <div class="field is-horizontal" v-if="printto === 'pdf'">
            <div class="field-label">
              <label class="label">page size</label>
            </div>
            <div class="field-body">
              <div class="field is-expanded">
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="printsize">
                      <option>default</option>
                      <option>A3</option>
                      <option>A4</option>
                      <option>A5</option>
                      <option>Legal</option>
                      <option>Letter</option>
                      <option>Tabloid</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="field is-horizontal" v-if="printto === 'pdf'">
            <div class="field-label">
              <label class="label">layout</label>
            </div>
            <div class="field-body">
              <div class="field is-narrow">
                <div class="control">
                  <label class="radio">
                    <input type="radio" name="pdflayout" value="portrait" v-model="printlayout">
                    portrait
                  </label>
                  <label class="radio">
                    <input type="radio" name="pdflayout" value="landscape" v-model="printlayout">
                    landscape
                  </label>                  
                </div>
              </div>
            </div>
          </div>
          <div class="field is-horizontal" v-if="printto === 'pdf'">
            <div class="field-label">
              <label class="label">margins</label>
            </div>
            <div class="field-body">
              <div class="field is-expanded">
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="printmargin">
                      <option value="0">default</option>
                      <option value="1">none</option>
                      <option value="2">minimum</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>         
          </div>  
          <div class="field is-horizontal">
            <div class="field-label">
            </div>
            <div class="field-body">
              <div class="field is-grouped">
                <p class="control">
                  <a class="button is-primary" @click="onPrintClick">
                    Print
                  </a>
                </p>
                <p class="control">
                  <a class="button is-light" @click="onCancelClick">
                    Cancel
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="print-wapper-right is-hidden-mobile">
      <htmlview ref="htmlview" mode="print" :html="html"></htmlview>
    </div>
  </div>
</template>

<script>
import HtmlView from '../../components/html/HtmlView'

const fs = require('fs')
export default {
  data() {
    return {
      subscriptions: [],
      fileprint: "current",
      printto: "pdf",
      printer: "default",
      printsilent: "no",
      printsize: "default",
      printlayout: "portrait",
      printmargin: 0,      
      printers: [],
      project: null,
      selected: null,
      html: ""
    }
  },
  created() {
    let currentWebContents = this.$electron.remote.getCurrentWebContents();
    if(currentWebContents) {
      let printers = currentWebContents.getPrinters();
      if(printers && printers.length > 0) {
        this.printers = printers;
      }
    }
    const projectchanged = this.$project.changed;
    let projectchangedSubscription = projectchanged.subscribe(value => {
      if(value) {
        this.update();
      } else {
        this.$router.replace("/home");
      }
    });
    this.subscriptions.push(projectchangedSubscription);
  },
  beforeDestroy() {
    this.subscriptions.forEach(function(subscription) {
      subscription.unsubscribe();
    }, this);
  },
  methods: {
    update() {      
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
        this.html = this.$converter.convert(selected.folder, source.data);  

        if(selected.id != pi.selected) {
          this.$project.setSelected(selected.id);
        } 

      } else {
        this.$router.replace("/home");
      }     
    },
    async onPrintClick() {
      try {
        if(this.printto === "printer") {
          let options = {
            deviceName: "",
            silent: false,
            printBackground: false,
          }         
          if(this.printer != "default")  {
            options.deviceName = this.printer;
          }
          if(this.printsilent != "no") {
            options.silent = true;
          }
          let result = await this.$refs.htmlview.print(options); 
        }
        else if(this.printto === "pdf") {
          let options = {
            marginsType: this.printmargin,
            printBackground: false,
            printSelectionOnly: false,
            landscape: false   
          };
          if(this.printsize != "default") {
            options.pageSize = this.printsize;
          }
          if(this.printlayout != "portrait") {
            options.landscape = true;
          }
          let data = await this.$refs.htmlview.printPdf(options);
          if(data) {
            var result = this.$electron.remote.dialog.showSaveDialog({
              title: "Save pdf document",   
              filters: [
                { name: "pdf", extensions: ["pdf"] },
                { name: "All Files", extensions: ["*"] }         
              ]
            });
            if(result) {
              let shell = this.$electron.remote.shell;
              fs.writeFile(result, data, function (error) {
                if (error) {
                  throw error
                }
                shell.openExternal('file://' + result);
              })
            }
          }
        }
      }
      catch(e) {        
        console.log(e);
      }
    },  
    onCancelClick() {
      this.$router.replace("/home");  
    }
  },
  components: {
    "htmlview": HtmlView
  }
}
</script>

<style scoped>
.print-wapper {
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;  
}
.print-wapper-left {
  display: flex;  
  flex: 1 1 auto;    
  border-radius: 0.2em;
  box-shadow: 0px 0px 5px rgb(75, 72, 72);
  background-color: rgba(0,0,0,0.5);
  padding-left: 0.5em;
  padding-right: 0.75em;  
  overflow: auto;
  justify-content: center; 
  align-items: stretch;   
}
.print-wapper-right {
  display: flex;  
  flex: 4 1 auto;      
  border-radius: 0.2em;
  background-color: white;
  display: flex;
  height: 100%;
}
.print-section {
  flex: 1 1 auto;
  margin: 2em;
}
.file-section {
  box-shadow: 0px 0px 5px rgba(75, 72, 72, 0.5);
  margin-bottom: 1em;
  padding: 0.75em;
}
.printer-section {
  box-shadow: 0px 0px 5px rgba(75, 72, 72, 0.5);
  padding: 0.75em;
}

</style>
