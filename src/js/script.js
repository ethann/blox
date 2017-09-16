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
        <div class="flow-group">
            <stage v-for="stageDetails in flowConfig.stages" :details="stageDetails"></stage>
        </div>`,
    created() {
        this.initDataWithSomeRandoms();
        this.dummyBlock.classList.add('flow-block');
        this.dummyBlock.classList.add('dummy');
        this.dummyBlock.textContent = "I'll be here";
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
        dragBlockTo(indexStage, indexBlock) {
            var oldData = this.flowConfig.stages[this.drag.stage].blocks.splice(this.drag.block, 1)[0];

            if(indexStage === this.drag.stage && indexBlock > this.drag.block) indexBlock--;
            this.flowConfig.stages[indexStage].blocks.splice(indexBlock, 0, oldData);
        },
        removeRemainingDummyBlock(event) {
            if(this.dummyBlock.parentNode !== null) {
                this.dummyBlock.parentNode.removeChild(this.dummyBlock)
            }
        },
        updateDummyBlockText() {
            this.dummyBlock.textContent = this.flowConfig.stages[this.drag.stage].blocks[this.drag.block];
        },
        setDraggingInfo(stageIndex, blockIndex) {
            this.drag.enabled = true;
            this.drag.stage = stageIndex;
            this.drag.block = blockIndex;
            this.drag.type = 'block';
            this.updateDummyBlockText();
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
            dummyBlock: document.createElement("DIV"),
            drag: {enabled: false, type: null, stage: -1, block: -1}
        }
    }
});

Vue.component('stage', {
    props: ['details'],
    template: `
        <div :class="{'flow-stage': true, 'dragging-block': $parent.drag.type === 'block'}" @dragover="prepareToDrop" @dragenter="prepareToDrop" @drop="drop" :accept="acceptWhileDragAndDrop">
            <block v-for="blockDetails in details.blocks" :details="blockDetails"></block>
        </div>`,
    methods: {
        prepareToDrop(event) {
            if(event.dataTransfer.types.includes(this.acceptWhileDragAndDrop)) {
                var [newDummyIndex, insertBefore] = this.calculateBlockIndex(event.clientX, event.clientY);
                var stageIndex = this.$parent.$children.indexOf(this);
                var children = this.$el.children;
                console.log(this.$parent.drag.stage, this.$parent.drag.block, stageIndex, newDummyIndex);
                
                // no changes?
                if(newDummyIndex === -1) {
                    event.preventDefault();
                    return;
                }
                
                if(this.$parent.drag.stage === stageIndex &&
                   (this.$parent.drag.block === newDummyIndex || this.$parent.drag.block === newDummyIndex-1)) {
                    this.$parent.removeRemainingDummyBlock();
                }
                else if(children.length === newDummyIndex) {
                    this.$el.appendChild(this.$parent.dummyBlock);
                }
                else {
                    this.$el.insertBefore(this.$parent.dummyBlock, children[insertBefore]);
                }

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
            var index = 0;
            var prevMiddle = 0;
            for(var childIndex=0; childIndex < children.length; childIndex++) {
                if(dummyIndex === childIndex) continue;
                var childCBB = children[childIndex].getBoundingClientRect();
                var middleOfChild = childCBB.top + childCBB.height/2;
                if(y >= prevMiddle && y < middleOfChild) break;
                prevMiddle = middleOfChild;
                index++;
            }

            if(index === dummyIndex) return [-1, -1];
            return [index, childIndex];
        }
    },
    data() {
        return {
            acceptWhileDragAndDrop: "text/plain"
        }
    }
});

Vue.component('block', {
    props: ['details'],
    template: `<div :class="{'flow-block': true, 'isDragged': isDragged}" draggable="true" @dragstart="prepareToDrag"
                    @dragend="endDragging">{{details}}</div>`,
    methods: {
        prepareToDrag(event) {
            var stageIndex = this.$parent.$parent.$children.indexOf(this.$parent);
            var blockIndex = this.$parent.$children.indexOf(this);
            event.dataTransfer.setData("text/plain", 'dummy message');
            event.dataTransfer.dropEffect = "move";
            event.dataTransfer.setDragImage(document.createElement('canvas'), -10, -10);
            this.$parent.$parent.setDraggingInfo(stageIndex, blockIndex);
            this.isDragged = true;
        },
        endDragging() {
            this.$parent.$parent.removeRemainingDummyBlock();
            this.$parent.$parent.clearDraggingInfo();
            this.isDragged = false;
        }
    },
    data() {
        return {
            isDragged: false
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