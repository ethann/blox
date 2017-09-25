Vue.component('tools', {
    template: `<div class="app-tools" :style="{width: width}">
        <div class="tools-resizer noselect" :class="{'is-resizing': isResizing}"
             @mousedown="onResizeStart">&lt;</div>
        <div class="tools-content">
            <slot></slot>
        </div>
    </div>`,
    created() {
        var recentWidth = window.localStorage.getItem('toolbar-width');
        if(recentWidth) this.width = recentWidth;

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
            this.lastWidth = this.width;
        },
        onResize(e) {
            if(!this.isResizing) return;
            
            var bodyWidth = document.body.getBoundingClientRect().width;
            var newWidth = bodyWidth - e.clientX - 20;
            var maxWidth = bodyWidth - 40;
            this.width = Math.max(this.minWidth, Math.min(newWidth, maxWidth));
        },
        onResizeStop() {
            this.isResizing = false;
            if(this.lastWidth !== this.width)
                window.localStorage.setItem('toolbar-width', this.width);
        }
    },
    data() {
        return {
            isResizing: false,
            width: 200,
            minWidth: 10,
            lastWidth: 0
        };
    }
});