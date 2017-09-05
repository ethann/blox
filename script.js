Vue.component('flow', {
    template: `
        <div class="flow-window">
            <stage v-for="stageDetails in flow.stages" :details="stageDetails"></stage>
        </div>`,
    data() {
        return {
            flow: { stages: [] }
        };
    },
    created() {
        this.initDataWithSomeRandoms();
    },
    methods: {
        initDataWithSomeRandoms() {
            var amountOfStages = Math.floor(Math.random()*10);
            for(var i=0; i<amountOfStages; ++i) {
                var amountOfBlocks = Math.floor(Math.random()*10);
                this.flow.stages.push({
                    blocks: Array.from(Array(amountOfBlocks).keys()).map(x=>x+'')
                });
            }
        }
    }
});

Vue.component('stage', {
    props: ['details'],
    template: `
        <div class="flow-stage">
            <block v-for="blockDetails in details.blocks" :details="blockDetails"></block>
        </div>`
});

Vue.component('block', {
    props: ['details'],
    template: `<div class="flow-block">{{details}}</div>`
});

new Vue({
    el: "#app"
})