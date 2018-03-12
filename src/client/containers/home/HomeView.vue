<template>
  <section class="section is-unselectable">
    <div class="container animated slideInLeft">
      <h1 class="title">Marker</h1>
      <p>A simple markdown editor that can do formulas and print to pdf :-)</p>
    </div>
  </section>   
</template>

<script>
export default {
  data() {
    return {
      subscriptions: []
    };
  },
  created() {
    const changed = this.$project.changed;
    let subscription = changed.subscribe(value => {
      if(value) {
        this.$router.replace("/view");
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
  }
};
</script>

<style scoped>

</style>
