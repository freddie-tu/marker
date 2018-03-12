<template>
  <div class="app-header">
    <nav class="navbar is-dark is-unselectable">
      <div class="navbar-brand navbar-content">
        <div class="navbar-item">
          <svg class="app-logo" width="32" height="20" viewBox="0 0 208 128">
	          <rect style="fill:none;stroke:#fff;stroke-width:10" width="198" height="118" x="5" y="5" ry="10" />
	          <path style="fill:#fff" d="m 30,98 0,-68 20,0 20,25 20,-25 20,0 0,68 -20,0 0,-39 -20,25 -20,-25 0,39 z" />
	          <path style="fill:#fff" d="m 155,98 -30,-33 20,0 0,-35 20,0 0,35 20,0 z" />
          </svg>
          <span class="app-title">Marker</span>                       
        </div>
        <div class="app-toolbar is-hidden-mobile">
          <a class="app-link" v-bind:class="[{'is-active': isSelectedItem('main')}]" v-on:click="toolbarItemClicked('main');">
            <span class="icon">
              <i class="fa fa-lg fa-home"></i>
            </span>
          </a>
          <a class="app-link" v-bind:class="[{'is-active': isSelectedItem('edit')}]" v-on:click="toolbarItemClicked('edit');">
            <span class="icon">
              <i class="fa fa-lg fa-pencil"></i>
            </span>
          </a>
          <a class="app-link" v-bind:class="[{'is-active': isSelectedItem('print')}]" v-on:click="toolbarItemClicked('print');">
            <span class="icon">
              <i class="fa fa-lg fa-print"></i>
            </span>
          </a>          
        </div>
        <div class="navbar-burger is-hidden-tablet" v-bind:class="{'is-active': menuToggle}" v-on:click="menuToggle = !menuToggle">
          <span></span>
          <span></span>
          <span></span> 
        </div>
      </div>
      <div class="navbar-menu is-hidden-tablet" v-bind:class="{'is-active': menuToggle}">
        <div class="navbar-end">
          <div class="navbar-item">
            <a class="navbar-link" v-bind:class="[{'is-active': isSelectedItem('main')}]" v-on:click="menuItemClicked('main');">
                <span class="icon">
                  <i class="fa fa-home"></i>
                </span>
                <span class="app-label">Home</span>
              </a>
          </div>
          <div class="navbar-item">
            <a class="navbar-link" v-bind:class="[{'is-active': isSelectedItem('edit')}]" v-on:click="menuItemClicked('edit');">
                <span class="icon">
                  <i class="fa fa-pencil"></i>
                </span>
                <span class="app-label">Edit</span>
              </a>
          </div>
          <div class="navbar-item">
            <a class="navbar-link" v-bind:class="[{'is-active': isSelectedItem('print')}]" v-on:click="menuItemClicked('print');">
                <span class="icon">
                  <i class="fa fa-print"></i>
                </span>
                <span class="app-label">Print</span>
              </a>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  props: ["selecteditem"],
  data() {
    return {
      menuToggle: false
    }
  },
  created() {
  },
  beforeDestroy() {
  },
  methods: {
    isSelectedItem(name) {
      return name === this.selectedItem ? true : false;
    },
    toolbarItemClicked(value) {
      this.$emit("itemclick", value);
    },
    menuItemClicked(value) {
      this.$emit("itemclick", value);
      if (this.menuToggle) {
        this.menuToggle = false;
      }
    }
  }
}
</script>

<style scoped>
.app-header {
  margin-bottom:3px;
}
.app-logo {
  opacity: 0.5;
}
.app-title {
  text-transform: uppercase;
  color: rgba(223, 221, 221, 0.9);
  text-shadow: 1px 1px 1px #000000;
  opacity: 0.9;
  font-size: 1.25em;
  margin-left: 0.3em;
}
.navbar {
  box-shadow: 0 0 10px black;
}

</style>
