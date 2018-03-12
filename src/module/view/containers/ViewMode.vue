<template>  
  <div class="html-view">
    <div class="html-container">
      <div class="html-content" v-html="html"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      subscription: null,
      html: ""
    }
  },
  created() {
    const html$ = this.$connect.html;
    this.subscription = html$.subscribe(value => {
      this.html = value;
    });
  },
  beforeDestroy() {
    this.subscription.unsubscribe();
  }
}
</script>

<style>
</style>
