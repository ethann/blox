Vue.component('tools', {
    template: `<div class="app-tools" :style="{width: toolWidth}">
        <div class="tools-resizer noselect"
             @mousedown="onResizeStart">&lt;</div>
        <div class="tools-content">
            <slot></slot>
        </div>
    </div>`,
    mounted() {
        document.addEventListener('mouseup', this.onResizeStop);
        document.addEventListener('mousemove', this.onResize);
    },
    destroyed() {
        document.removeEventListener('mouseup', this.onResizeStop);
        document.removeEventListener('mousemove', this.onResize);
    },
    methods: {
        onResizeStart() {
            this.isResizing = true;
        },
        onResize(e) {
            if(!this.isResizing) return;

            var newWidth = this.toolWidth - event.movementX;
            this.toolWidth = Math.max(this.toolMinWidth, Math.min(newWidth, this.toolMaxWidth));
        },
        onResizeStop() {
            this.isResizing = false;
        }
    },
    data() {
        return {
            isResizing: false,
            toolWidth: 200,
            toolMinWidth: 10,
            toolMaxWidth: 600
        };
    }
});