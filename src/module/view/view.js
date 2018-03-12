import Vue from 'vue';
import ViewMain from './View.vue';

import ViewElectron from './plugins/view-electron';
import ViewLogger from './plugins/view-logger';
import ViewConnect from './plugins/view-connect';

import router from './router';

Vue.use(ViewElectron);
Vue.use(ViewLogger);
Vue.use(ViewConnect, router);

new Vue({
    el: '#view',
    router,
    template: '<view-main/>',
    components: { 
      'view-main': ViewMain
    }
  });    
   