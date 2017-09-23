Vue.component('flow-workspace', {
    props: ['currentFlows'],
    template: `
        <div :class="{'flow-workspace':true, 'move-content':canBeMoved}" @mousemove="onWorkspaceDrag"
             @wheel="onWorkspaceZoom">
            <div :class="{'flow-perspective':true, 'unactive':canBeMoved}"
                 :style="{top:perspectivePosition[0], left:perspectivePosition[1], transform:zoom}">
                <flow v-for="flowConfig in currentFlows" :flow-config="flowConfig.flow"></flow>
            </div>
        </div>`,
    methods: {
        onKeyDown(event) {
            if(event.keyCode === ' '.charCodeAt(0)) this.canBeMoved = true;
            if(event.keyCode === 'R'.charCodeAt(0)) this.resetPosition();
        },
        onKeyUp(event) {
            if(event.keyCode === ' '.charCodeAt(0)) this.canBeMoved = false;
        },
        onWorkspaceDrag(event) {
            if(!this.canBeMoved) return false;
            // console.log(event)
            this.perspectivePosition[0] += event.movementY;
            this.perspectivePosition[1] += event.movementX;
            this.$forceUpdate();
        },
        onWorkspaceZoom(event) {
            var newZoomLevel = this.zoomLevel;
            if(event.deltaY < 0) newZoomLevel--;
            if(event.deltaY > 0) newZoomLevel++;

            this.zoomLevel = Math.max(-5, Math.min(newZoomLevel, 5));
        },
        resetPosition() {
            this.perspectivePosition.fill(0);
            this.$forceUpdate();
        }
    },
    computed: {
        zoom() {
            return 'scale(' + (1 - this.zoomLevel/10) + ')';
        }
    },
    created() {
        KeyEvents.listen('keyup', this.onKeyUp);
        KeyEvents.listen('keydown', this.onKeyDown);
    },
    data() {
        return {
            canBeMoved: false,
            perspectivePosition: [0, 0],
            zoomLevel: 0
        };
    }
});