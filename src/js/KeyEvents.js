window.KeyEvents = new class {
    constructor() {
        this.vm = new Vue();
        this.CTRL = 17;
    }

    fire(event, data) {
        this.vm.$emit(event, data);
    }

    listen(event, callback) {
        this.vm.$on(event, callback);
    }
};
