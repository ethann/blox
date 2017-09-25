window.main = function() {
    document.addEventListener('keydown', e => KeyEvents.fire('keydown', e));
    document.addEventListener('keyup', e => KeyEvents.fire('keyup', e));

    window.vm = new Vue({
        el: "#app",
        created() {
            this.currentFlows.push({
                name: 'customFlow',
                flow: { stages: [] }
            });
            this.$on('stageSelected', this.stageSelected);
            this.$on('blockSelected', this.blockSelected);
        },
        data: {
            currentFlows: [],
            currentToolset: [],
            plugins: []
        },
        methods: {
            stageSelected(stageIndex) {
                console.log(stageIndex);
                this.plugins.forEach(plugin => plugin.setStage(stageIndex));
            },
            blockSelected(stageIndex, blockIndex) {
                console.log(stageIndex, blockIndex);
                this.plugins.forEach(plugin => plugin.setBlock(stageIndex, blockIndex));
            }
        }
    });

    var vm = window.vm;
    vm.plugins.push(new XJson());
};

window.addEventListener('load', main);