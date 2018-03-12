<template>
  <div class="app-footer-wrapper">
    <div class="app-footer">
      <span v-if="loaded">project loaded</span>      
      <span v-if="!loaded">no project loaded</span>      
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      subscriptions: [],
      loaded: false
    }
  },
  created() {
    const projectchanged = this.$project.changed;
    let projectchangedSubscription = projectchanged.subscribe(value => {
      if(value) {
        this.loaded = true;
      } else {
        this.loaded = false
      }
    });
    this.subscriptions.push(projectchangedSubscription);    
  },
  beforeDestroy() {
    this.subscriptions.forEach(function(subscription) {
      subscription.unsubscribe();
    }, this);
  }
}
</script>

<style>
.app-footer-wrapper {
  margin-top: 3px;
}
.app-footer {
  box-shadow: 0 0 10px black;
  color: rgb(155, 152, 152);
  padding-left: 0.25em;
  font-size: 12px;
}
</style>
 