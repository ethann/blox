Vue.component('flow-workspace', {
    props: ['currentFlows'],
    template: `
        <div class="flow-workspace">
            <flow v-for="flowConfig in currentFlows" :flow-config="flowConfig.flow"></flow>
        </div>`
});