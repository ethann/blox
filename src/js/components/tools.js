Vue.component('tools', {
    template: `<div class="app-tools" :style="{width: width}">
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

            var bodyWidth = document.body.getBoundingClientRect().width;
            var newWidth = bodyWidth - e.clientX - 20;
            var maxWidth = Math.min(this.toolMaxWidth, bodyWidth-40);
            this.width = Math.max(this.minWidth, Math.min(newWidth, this.maxWidth));
        },
        onResizeStop() {
            this.isResizing = false;
        }
    },
    data() {
        return {
            isResizing: false,
            width: 200,
            minWidth: 10,
            maxWidth: 600
        };
    }
});