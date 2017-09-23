Vue.component('tool', {
    template: `
        <div class="tools-tool">
            <header class="tool-header" @click="toggled=!toggled">
                color picker
            </header>
            <div class="tool-content" v-show="toggled">
                <slot></slot>
            </div>
        </div>`,
    data() {
        return {
            toggled: true
        };
    }
});