class Point {
  constructor(x, y) {
      this.x = x;
      this.y = y;
  }
}

class TowerBlock {
  static maxBlockWidth = 90;

  constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
  }

  paint() {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "black";
      ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  // for max block width that can be returned see this.maxBlockWidth
  static getRandomBlockWidth() {
      // Make sure that human eyes can tell the difference between the
      // widths of 2 different TowerBlocks (e.g. one with the width of
      // 32 and another of 33 looks the same to the human eye). Thus
      // we use widths of 10 +/- n_nonDecimal*5 -> 10, 15, ..., 90.
      let randomWidth = 10 + Math.floor(16 * Math.random()) * 5;
      // allow only uneven widths as it makes centered stacking possible
      return randomWidth % 2 == 0 ? --randomWidth : randomWidth;
  }
}

class StackManager {

  constructor(countTowerBlocks = 5) {
      this.coordinateOrigin = new Point(50, 120);
      // This better not be variably user picked, else it becomes
      // likely that it cannot fully be displayed in the UI.
      this.towerBlockHeight = 9;
      this.stackWidth = 100;

      if (countTowerBlocks < 0 || countTowerBlocks > 10) {
          alert("Invalid amount of TowerBlocks! Might be unable to display them all.");
      }
      this.countTowerBlocks = countTowerBlocks;

      this.stacks = this.generateStacks();
      this.countTowerBlockMoves = 0;
  }

  // Generates stacks and TowerBlocks, which are all placed into the
  // first stack (index 0).
  generateStacks() {
      let stacks = [
          [],
          [],
          []
      ]

      let i;
      for (i = 0; i < this.countTowerBlocks; ++i) {
          // Block should never have a width > 90 as it doesn't fit into the
          // output window of repl.it anymore (That applies for using merely 5 TowerBlocks).
          let randomWidth = TowerBlock.getRandomBlockWidth();
          let newTowerBlock = new TowerBlock(
              this.coordinateOrigin.x - Math.floor(randomWidth / 2),
              this.coordinateOrigin.y - i * (this.towerBlockHeight + 1),
              randomWidth,
              this.towerBlockHeight
          );

          stacks[0].push(newTowerBlock);
      }

      return stacks;
  }

  paintStackAreaWhite() {
      const x = this.coordinateOrigin.x - TowerBlock.maxBlockWidth / 2;
      const y =
        this.coordinateOrigin.y -
        ((this.countTowerBlocks - 1) * (this.towerBlockHeight + 1));
      const width = this.stacks.length * this.stackWidth;
      const height = this.countTowerBlocks * (this.towerBlockHeight + 1);

      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(x, y, width, height);
  }

  paintAllStacks() {
      // erase previous drawings
      this.paintStackAreaWhite();

      let i;
      for (i = 0; i < this.stacks.length; ++i) {

          let j;
          for (j = 0; j < this.stacks[i].length; ++j) {
              this.stacks[i][j].paint();
          }
      }
  }

  // pops TowerBlock from source stack and moves it
  // to the destination stack
  moveTowerBlock(indexSourceStack, indexDestinationStack) {
    
    /*if(this.stacks[indexSourceStack].length == 0) {
        alert("We've got a problem here!");
    }*/
    
    let movedTowerBlock = this.stacks[indexSourceStack].pop();

      movedTowerBlock.x += this.stackWidth * (indexDestinationStack - indexSourceStack);
      movedTowerBlock.y =
          this.coordinateOrigin.y -
          this.calculateTowerHeight(indexDestinationStack);

      this.stacks[indexDestinationStack].push(movedTowerBlock);

      ++this.countTowerBlockMoves;
  }

  // Each stack of the member array "stacks" represents a tower.
  calculateTowerHeight(stackIndex) {
      return this.stacks[stackIndex].length *
          (this.towerBlockHeight + 1 /*1 pixel space between each block*/ );
  }

  findIndexWidestTowerBlock(stackIndex) {
    let indexWidestTowerBlock = this.stacks[stackIndex].length - 1;

    let i;
    for(i = indexWidestTowerBlock - 1; i >= 0; --i) {
        if(
            this.stacks[stackIndex][i].width >
            this.stacks[stackIndex][indexWidestTowerBlock].width) {
                indexWidestTowerBlock = i;
        }
    }

    return indexWidestTowerBlock;
  }

  // In addition to .findWidestTowerBlock this function also
  // finds out which of the first two stacks has got a wider
  // TowerBlock. First element (index 0) of returned array is the
  // stack index and second being (index 1) being the TowerBlock index.
  findIndicesWidestTowerBlock() {
      let indexWidestTowerBlock1stStack = this.findIndexWidestTowerBlock(0);
      let indexWidestTowerBlock2ndStack = this.findIndexWidestTowerBlock(1);

      let maxWidth1stStack =
        (this.stacks[0].length == 0 ?
        0 : this.stacks[0][indexWidestTowerBlock1stStack].width);
      let maxWidth2ndStack =
        (this.stacks[1].length == 0 ?
        0 : this.stacks[1][indexWidestTowerBlock2ndStack].width);

      return maxWidth1stStack > maxWidth2ndStack ?
        [0, indexWidestTowerBlock1stStack] :
        [1, indexWidestTowerBlock2ndStack];
  }
  
  // Returns how many ms will likely pass until
  // .moveWidestTowerBlockTo3rdStack
  // is completed.
  // NOTE: This will ONLY work when called RIGHT BEFORE
  // the call to .moveWidestTowerBlockTo3rdStack!
  estimateTimeInMs_moveWidestTowerBlockTo3rdStack() {
    const timeStepsInMs = 300;
    let indicesWidestTowerBlock = this.findIndicesWidestTowerBlock();

    let i;
      let delayTime = timeStepsInMs;
      stackManager.paintAllStacks();
      // Can't use i < length as condition, because setTimeout is used.
      for (i = this.stacks[indicesWidestTowerBlock[0]].length - 1; i > indicesWidestTowerBlock[1]; --i) {
            delayTime += timeStepsInMs;
        }

        // add some ms just in case
        return delayTime + 500;
  }

  moveWidestTowerBlockTo3rdStack() {
    const timeStepsInMs = 300;
    let indicesWidestTowerBlock = this.findIndicesWidestTowerBlock();

    console.log(`indicesWidestTowerBlock: ${indicesWidestTowerBlock}`);

    let i;
      let delayTime = timeStepsInMs;
      stackManager.paintAllStacks();
      // Can't use i < length as condition, because setTimeout is used.
      for (i = this.stacks[indicesWidestTowerBlock[0]].length - 1; i > indicesWidestTowerBlock[1]; --i) {
            setTimeout(() => {
              stackManager.moveTowerBlock(
                indicesWidestTowerBlock[0],
                indicesWidestTowerBlock[0] == 0 ? 1 : 0);
              stackManager.paintAllStacks();
            }, delayTime);

            delayTime += timeStepsInMs;
        }

        setTimeout(() => {
            stackManager.moveTowerBlock(indicesWidestTowerBlock[0], 2);
            stackManager.paintAllStacks();
          }, delayTime);
    }

    solveTowerOfFanoi() {

        let nextWaitingTimeInMs = 0;
        let currentWaitingTimeInMs = 0;
        let i;
        for(i = 0; i < 10; ++i) {
            nextWaitingTimeInMs += this.estimateTimeInMs_moveWidestTowerBlockTo3rdStack();

            setTimeout(() => {
                this.moveWidestTowerBlockTo3rdStack();
            }, currentWaitingTimeInMs);
            currentWaitingTimeInMs = nextWaitingTimeInMs;
        }
        
        setTimeout(() => {
            console.log(`${this.countTowerBlockMoves} moves were required.`);
            //alert(`${this.countTowerBlockMoves} moves were required.`);
        }, nextWaitingTimeInMs);
    }
}

class DEBUG {

  static test_StackManager_calculateTowerHeight() {
      let i = 0;
      for (i = 0; i < stackManager.stacks.length; ++i) {
          console.log(
              `tower #${i} has the height ${stackManager.calculateTowerHeight(stackManager.stacks[i])}`
          );
      }
  }
}


stackManager = new StackManager(10);
stackManager.solveTowerOfFanoi();
