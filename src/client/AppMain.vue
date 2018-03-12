<template>
  <div class="app-fullscreen">
    <div class="app-top">      
      <app-header v-bind:selecteditem="active" v-on:itemclick="headerItemClick"></app-header>
    </div>
    <div class="app-middle">
      <router-view></router-view>
    </div>
    <div class="app-bottom">
      <app-footer></app-footer>
    </div>   
  </div>  
</template>
 
<script>
import AppHeader from './components/app/AppHeader'
import AppFooter from './components/app/AppFooter'
export default {
  data() {
    return {
      active: 'main',
    }
  },
  created() {
  },
  beforeDestroy() {
  },
  methods: {
    headerItemClick(value) {
      switch(value) {
        case "main": {
          this.$router.push('/home');
          break;
        }
        case "edit": {
          this.$router.push('/edit');
          break;
        }
        case "print": {
          this.$router.push('/print');
          break;
        }
      }
    }
  },
  components: {
    "app-header": AppHeader,
    "app-footer": AppFooter
  }
};
</script>

<style scoped>
</style>
