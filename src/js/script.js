var KeyEvents = new class {
    constructor() {
        this.vm = new Vue();
    }

    fire(event, data) {
        this.vm.$emit(event, data);
    }

    listen(event, callback) {
        this.vm.$on(event, callback);
    }
};

document.addEventListener('keydown', e => KeyEvents.fire('keydown', e));
document.addEventListener('keyup', e => KeyEvents.fire('keyup', e));

Vue.component('flow-workspace', {
    props: ['currentFlows'],
    template: `
        <div class="flow-workspace">
            <flow v-for="flowConfig in currentFlows" :flow-config="flowConfig.flow"></flow>
        </div>`
});

Vue.component('flow', {
    props: ['flowConfig'],
    template: `
        <div :class="{'flow-group': true, 'dragging-stage': drag.type === 'stage'}"
             @dragover="prepareToDrop" @dragenter="prepareToDrop" @drop="drop">
            <stage v-for="stageDetails in flowConfig.stages" :details="stageDetails"></stage>
        </div>`,
    created() {
        this.initDataWithSomeRandoms();
        this.dummyBlock.classList.add('flow-block');
        this.dummyBlock.classList.add('dummy');
        this.dummyStage.classList.add('flow-stage');
        this.dummyStage.classList.add('dummy');
    },
    methods: {
        initDataWithSomeRandoms() {
            var amountOfStages = Math.floor(Math.random()*10);
            for(var i=0; i<amountOfStages; ++i) {
                var amountOfBlocks = Math.floor(Math.random()*10);
                this.flowConfig.stages.push({
                    blocks: Array.from(Array(amountOfBlocks).keys()).map(x => x + '')
                });
            }
        },
        dragStageTo(indexStage) {
            var oldData = this.flowConfig.stages.splice(this.drag.stage, 1)[0];

            if(indexStage > this.drag.stage) indexStage--;
            this.flowConfig.stages.splice(indexStage, 0, oldData);
        },
        insertDummyStage(index) {
            if(index === -1)
                return false;

            var children = this.$el.children;
            if(children.length === index)
                this.$el.appendChild(this.dummyStage);
            else
                this.$el.insertBefore(this.dummyStage, children[index]);

            return true;
        },
        removeRemainingDummyStage(event) {
            if(this.dummyStage.parentNode !== null) {
                this.dummyStage.parentNode.removeChild(this.dummyStage);
            }
        },
        prepareToDrop(event) {
            if(event.dataTransfer.types.includes(this.acceptWhileDragAndDrop)) {
                var newIndex = this.calculateStageIndex(event.clientX, event.clientY);
                
                this.insertDummyStage(newIndex);
                event.preventDefault();
                return;
            }
        },
        drop(event) {
            var children = Array.from(this.$el.children);
            var dummyIndex = children.indexOf(this.dummyStage);
            if(dummyIndex === -1) return;

            this.dragStageTo(dummyIndex);
        },
        calculateStageIndex(x, y) {
            var children = Array.from(this.$el.children);
            var dummyIndex = children.indexOf(this.dummyStage);
            var childIndex = 0;
            var prevMiddle = 0;
            for(childIndex=0; childIndex < children.length; childIndex++) {
                if(dummyIndex === childIndex) continue;
                if(children[childIndex].classList.contains('hidden')) continue;
                var childCBB = children[childIndex].getBoundingClientRect();
                var middleOfChild = childCBB.left + childCBB.width/2;
                if(x >= prevMiddle && x < middleOfChild) break;
                prevMiddle = middleOfChild;
            }

            if(childIndex === dummyIndex) return -1;
            return childIndex;
        },
        dragBlockTo(indexStage, indexBlock) {
            var oldData = this.flowConfig.stages[this.drag.stage].blocks.splice(this.drag.block, 1)[0];

            if(indexStage === this.drag.stage && indexBlock > this.drag.block) indexBlock--;
            this.flowConfig.stages[indexStage].blocks.splice(indexBlock, 0, oldData);
        },
        removeRemainingDummyBlock(event) {
            if(this.dummyBlock.parentNode !== null) {
                this.dummyBlock.parentNode.removeChild(this.dummyBlock);
            }
        },
        updateDummyBlockText() {
            this.dummyBlock.textContent = this.flowConfig.stages[this.drag.stage].blocks[this.drag.block];
        },
        updateDummyStageText() {
            this.dummyStage.innerHTML = this.$children[this.drag.stage].$el.innerHTML;
        },
        setDraggingInfo(stageIndex, blockIndex) {
            this.drag.enabled = true;
            this.drag.stage = stageIndex;
            this.drag.block = blockIndex;
            this.drag.type = blockIndex === -1? 'stage': 'block';
            if(this.drag.type === 'block')
                this.updateDummyBlockText();
            else
                this.updateDummyStageText();

        },
        clearDraggingInfo() {
            this.drag.enabled = false;
            this.drag.stage = -1;
            this.drag.block = -1;
            this.drag.type = null;
        }
    },
    data() {
        return {
            acceptWhileDragAndDrop: "stage",
            dummyBlock: document.createElement("DIV"),
            dummyStage: document.createElement("DIV"),
            drag: {enabled: false, type: null, stage: -1, block: -1}
        }
    }
});

Vue.component('stage', {
    props: ['details'],
    template: `
        <div :class="{'flow-stage': true, 'hidden': isHidden,
                      'dragging-block': $parent.drag.type === 'block', 'noselect': true}"
             @dragover="prepareToDrop" @dragenter="prepareToDrop" @drop="drop"
             :draggable="canBeDragged"
             @dragstart="prepareToDrag" @dragend="endDragging">
            <block v-for="blockDetails in details.blocks" :details="blockDetails"></block>
        </div>`,
    created() {
        KeyEvents.listen('keyup', this.onKeyUp);
        KeyEvents.listen('keydown', this.onKeyDown);
    },
    methods: {
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
            if(event.keyCode === 17) this.canBeDragged = true;
        },
        onKeyUp(event) {
            if(event.keyCode === 17) this.canBeDragged = false;
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
            if(event.keyCode === 17) this.canBeDragged = false;
        },
        onKeyUp(event) {
            if(event.keyCode === 17) this.canBeDragged = true;
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

new Vue({
    el: "#app",
    created() {
        this.currentFlows.push({
            name: 'customFlow',
            flow: { stages: [] }
        })
    },
    data: {
        currentFlows: []
    }
})