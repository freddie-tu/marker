<template>
  <router-view></router-view>
</template>

<script>
export default {
  data() {
    return {
      subscription: null,
      mode: "none"
    }
  },
  created() {
    const properies$ = this.$connect.properies;
    this.subscription = properies$.subscribe(value => {      
      if(value.mode && value.mode != this.mode) {
        switch(value.mode)
        {
          case "view": {
            this.$router.replace("/view");
            this.mode = "view";            
            break;
          }
          case "print": {
            this.$router.replace("/print");
            this.mode = "print";            
            break;
          }
          default: {
            this.$router.replace("/none");
            this.mode = "none";            
            break;
          }
        }
      }      
    });
  },
  beforeDestroy() {
    this.subscription.unsubscribe();
  }
}
</script>

<style>

</style>
