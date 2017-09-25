class Plugin {
    constructor() {
        this.activeStage = -1;
        this.activeBlock = -1;
    }

    setStage(newStage) {
        this.activeStage = newStage;
        this.activeBlock = -1;
    }
    
    setBlock(newStage, newBlock) {
        this.activeStage = newStage;
        this.activeBlock = newBlock;
    }
};

class XJson extends Plugin{
    constructor() {
        super();
        this.toolset = [];
        this.flow = {};
    }

    configureTools() {
        // prepare tools
    }

    setStage(newStage) {
        super.setStage(newStage);
        console.log('currently active stage: ', this.activeStage);
    }
    
    setBlock(newStage, newBlock) {
        super.setBlock(newStage, newBlock);
        console.log('currently active block: ', this.activeStage, this.activeBlock);
    }
}