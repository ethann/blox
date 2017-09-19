Vue.component('block', {
    props: ['details'],
    template: `<div :class="{'flow-block': true, 'noselect': true, 'hidden': isHidden}"
                    :draggable="canBeDragged"
                    @dragstart="prepareToDrag" @dragend="endDragging">{{details}}</div>`,
    created() {
        KeyEvents.listen('keyup', this.onKeyUp);
        KeyEvents.listen('keydown', this.onKeyDown);
    },
    methods: {
        prepareToDrag(event) {
            if(!this.canBeDragged) return false;
            var stageIndex = this.$parent.$parent.$children.indexOf(this.$parent);
            var blockIndex = this.$parent.$children.indexOf(this);
            event.dataTransfer.setData("block", 'dummy message');
            event.dataTransfer.dropEffect = "move";
            event.dataTransfer.setDragImage(document.createElement('canvas'), -10, -10);
            this.$parent.$parent.setDraggingInfo(stageIndex, blockIndex);
            this.isDragged = true;
                        
            setTimeout(() => {
                this.$parent.insertDummyBlock(this.$parent.$children.indexOf(this));
                this.isHidden = true;
            });
        },
        endDragging() {
            this.$parent.$parent.removeRemainingDummyBlock();
            this.$parent.$parent.clearDraggingInfo();
            this.isDragged = false;
            this.isHidden = false;
        },
        onKeyDown(event) {
            if(event.keyCode === KeyEvents.CTRL) this.canBeDragged = false;
        },
        onKeyUp(event) {
            if(event.keyCode === KeyEvents.CTRL) this.canBeDragged = true;
        }
    },
    data() {
        return {
            isDragged: false,
            canBeDragged: true,
            isHidden: false
        }
    }
});
