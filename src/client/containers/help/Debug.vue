<template>
  <div class="debug-wrapper">
    <div class="debug-left">
      <button @click="openClick">Open devtootls</button>
      <button @click="sendClick">Set Current</button>
      <button @click="sendScroll">scroll</button>
    </div>
    <div class="debug-right">
      <htmlview  ref="html" mode="print" :html="html"></htmlview>
    </div>        
  </div>
</template>

<script>
import HtmlView from "../../components/html/HtmlView";

export default {
  data() {
    return {
      html: "<h1>initial html</h1>"
    };
  },
  methods: {
    openClick() {
      this.$refs.html.openDevTools();
    },
    sendScroll() {
      this.$refs.html.scrolltoTag("h2", 7);
    },
    sendClick() {
      try {
        let pi = this.$project.getProjectInfo();
        if (pi && pi.files && pi.files.length > 0) {
          let selected = null;
          if (pi.selected) {
            selected = pi.files.find(f => f.id === pi.selected);
          }
          if (!selected && pi.files.length > 0) {
            selected = pi.files[0];
          }
          if (selected) {
            let source = this.$project.getSource(selected.id);
            if(source) {
              this.html = this.$converter.convert(selected.folder, source.data);  
            } else {
              this.html = "no current source";  
            }
          } else {
            this.html = "no current document";
          }
        }
        else {
          this.html = "no project open";
        }
      }
      catch(e) {
        this.html = e;
      }
    }
  },
  components: {
    htmlview: HtmlView
  }
};
</script>

<style scoped>
.debug-wrapper {
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}
.debug-left {
  flex: 1 1 auto;
  background-color: rgba(0, 0, 0, 0.5);
}
.debug-right {
  background-color: white;
  display: flex;
  flex: 4 1 auto;
}
</style>
