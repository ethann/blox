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