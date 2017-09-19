window.main = function() {
    document.addEventListener('keydown', e => KeyEvents.fire('keydown', e));
    document.addEventListener('keyup', e => KeyEvents.fire('keyup', e));

    window.vm = new Vue({
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
    });
};

window.addEventListener('load', main);