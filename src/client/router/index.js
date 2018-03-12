import Vue from 'vue'
import Router from 'vue-router'

import HomeView from '../containers/home/HomeView'
import ViewMode from '../containers/view/ViewMode'
import EditMode from '../containers/edit/EditMode'
import PrintView from '../containers/print/Print'
import HelpDefault from '../containers/help/Default'
import HelpAbout from '../containers/help/About'
import HelpDebug from '../containers/help/Debug'


Vue.use(Router)

export default new Router({
    routes: [
        { path: '/home', component: HomeView },
        { path: '/view', component: ViewMode },
        { path: '/edit', component: EditMode }, 
        { path: '/print', component: PrintView }, 
        { path: '/help', component: HelpDefault,
          children: [
            { path: 'debug', component: HelpDebug },
            { path: 'about', component: HelpAbout },
          ]
        },       
        { path: '*', redirect: '/home' }
    ]
})