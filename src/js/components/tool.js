Vue.component('tool', {
    template: `
        <div class="tools-tool">
            <header class="tool-header" @click="collapsed=!collapsed" :class="{'collapsed': collapsed}">
                color picker
            </header>
            <div class="tool-content" v-show="!collapsed">
                <slot></slot>
            </div>
        </div>`,
    data() {
        return {
            collapsed: false
        };
    }
});