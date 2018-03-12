<template>
  <webview class="htmlview" ref="webhtml" src="view/view.html" nodeintegration></webview>
</template>

<script>
const modelist = ['view', 'print']

export default {
  props: {
    html: String,
    mode: {
      type: String,
      default: 'view',
      validator: (val) => modelist.findIndex((mode) => mode === val) > -1
    },
  },
  data() {
    return {
      htmldata: null
    };
  },
  mounted() {
    this.htmldata = this.html;
    this.$refs.webhtml.addEventListener("ipc-message", event => {
      switch (event.channel) {
        case "view-ready": {
          this.onWebviewReady();
        }
      }
    });
  },
  methods: {
    openDevTools() {
      this.$refs.webhtml.openDevTools();
    },
    onWebviewReady() {
      this.updateProps();
      this.updateHtml();
    },
    updateProps() {
      let props = {
        mode: this.mode
      };
      this.$refs.webhtml.send("view-set-props", props);
    },
    print(options) {
      return new Promise((resolve, reject) => { 
        this.$refs.webhtml.print(options, (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }          
        });
      });
    },    
    printPdf(options) {
      return new Promise((resolve, reject) => { 
        this.$refs.webhtml.printToPDF(options, (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }          
        });
      });
    },
    scrolltoTag(tag, index) {
      let js = `document.getElementsByTagName('${tag}')[${index}].scrollIntoView();`;
      this.$refs.webhtml.executeJavaScript(js);
    },
    updateHtml() {      
      this.$refs.webhtml.send("view-set-html", this.htmldata);
    }
  },
  watch: {
    html(value) {
      this.htmldata = value;
      this.updateHtml();
    },
    mode() {
      this.updateProps()
    },
  }
};
</script>

<style scoped>
.htmlview {
  flex:1 1 auto;  
}

</style>
