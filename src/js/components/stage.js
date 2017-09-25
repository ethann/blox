Vue.component('stage', {
    props: ['details'],
    template: `
        <div :class="{'flow-stage': true, 'hidden': isHidden,
                      'dragging-block': $parent.drag.type === 'block', 'noselect': true}"
             @dragover="prepareToDrop" @dragenter="prepareToDrop" @drop="drop"
             :draggable="canBeDragged" @click.self="selectStage"
             @dragstart="prepareToDrag" @dragend="endDragging">
            <block v-for="blockDetails in details.blocks" :details="blockDetails"></block>
        </div>`,
    created() {
        KeyEvents.listen('keyup', this.onKeyUp);
        KeyEvents.listen('keydown', this.onKeyDown);
    },
    methods: {
        selectStage() {
            var stageIndex = this.$parent.$children.indexOf(this);
            window.vm.$emit('stageSelected', stageIndex);
        },
        prepareToDrag() {
            if(!this.canBeDragged) return false;
            var stageIndex = this.$parent.$children.indexOf(this);
            event.dataTransfer.setData("stage", 'dummy message');
            event.dataTransfer.dropEffect = "move";
            event.dataTransfer.setDragImage(document.createElement('canvas'), -10, -10);
            this.$parent.setDraggingInfo(stageIndex, -1);
            this.isDragged = true;

            setTimeout(() => {
                this.$parent.insertDummyStage(this.$parent.$children.indexOf(this));
                this.isHidden = true;
            });
        },
        endDragging() {
            this.$parent.removeRemainingDummyStage();
            this.$parent.clearDraggingInfo();
            this.isDragged = false;
            this.isHidden = false;
        },
        onKeyDown(event) {
            if(event.keyCode === KeyEvents.CTRL) this.canBeDragged = true;
        },
        onKeyUp(event) {
            if(event.keyCode === KeyEvents.CTRL) this.canBeDragged = false;
        },
        insertDummyBlock(index) {
            if(index === -1)
                return false;

            var children = this.$el.children;
            if(children.length === index)
                this.$el.appendChild(this.$parent.dummyBlock);
            else
                this.$el.insertBefore(this.$parent.dummyBlock, children[index]);

            return true;
        },
        prepareToDrop(event) {
            if(event.dataTransfer.types.includes(this.acceptWhileDragAndDrop)) {
                var newIndex = this.calculateBlockIndex(event.clientX, event.clientY);
                
                this.insertDummyBlock(newIndex);

                event.preventDefault();
            }
        },
        drop(event) {
            var children = Array.from(this.$el.children);
            var dummyIndex = children.indexOf(this.$parent.dummyBlock);
            if(dummyIndex === -1) return;

            this.$parent.dragBlockTo(this.$parent.$children.indexOf(this), dummyIndex);
        },
        calculateBlockIndex(x, y) {
            var children = Array.from(this.$el.children);
            var dummyIndex = children.indexOf(this.$parent.dummyBlock);
            var prevMiddle = 0;
            var childIndex = 0;
            for(childIndex; childIndex < children.length; childIndex++) {
                if(dummyIndex === childIndex) continue;
                if(children[childIndex].classList.contains('hidden')) continue;
                var childCBB = children[childIndex].getBoundingClientRect();
                var middleOfChild = childCBB.top + childCBB.height/2;
                if(y >= prevMiddle && y < middleOfChild) break;
                prevMiddle = middleOfChild;
            }

            if(childIndex === dummyIndex) return -1;
            return childIndex;
        }
    },
    data() {
        return {
            acceptWhileDragAndDrop: "block",
            isDragged: false,
            canBeDragged: false,
            isHidden: false
        }
    }
});
