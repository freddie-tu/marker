import Vue from 'vue';
import AppMain from './AppMain';

import AppElectron from './plugins/app-electron';
import AppLogger from './plugins/app-logger';
import AppProject from './plugins/app-project';
import AppConverter from './plugins/app-converter';

//init router
import router from './router';

Vue.use(AppElectron, router);
Vue.use(AppLogger);
Vue.use(AppProject);
Vue.use(AppConverter);

new Vue({
  el: '#app',
  router,
  template: '<app-main/>',
  components: { 
    'app-main': AppMain
  }
});    
