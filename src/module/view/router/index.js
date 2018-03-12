import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import NoneMode from "../containers/NoneMode";
import ViewMode from "../containers/ViewMode";
import PrintMode from "../containers/PrintMode";

export default new Router({
  routes: [
    { path: '/none', component: NoneMode },
    { path: '/view', component: ViewMode },
    { path: '/print', component: PrintMode },
    { path: '*', redirect: '/none' }
  ]
});

