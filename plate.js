export class Plate {
    constructor(fieldItem) {
        this.plateItem = document.createElement("div");
        this.plateItem.classList.add("plate");
        this.setStyle(Math.random() > 0.5 ? 2 : 4);
        fieldItem.append(this.plateItem);
    }

    setCoordinate(x, y) {
        this.x = x;
        this.y = y;
        this.plateItem.style.setProperty("--x", x);
        this.plateItem.style.setProperty("--y", y);
    }

    setStyle(number) {
       this.number = number;
       this.plateItem.textContent = number;
       const bgColor = 100 - Math.log2(number) * 9;
       this.plateItem.style.setProperty("--bg-color", `${bgColor}%`);
       this.plateItem.style.setProperty("--text-color", `${bgColor < 50 ? 90 : 10}%`);
       if (number > 1000) {
        this.plateItem.style.setProperty("--text-size", '5vmin')
       }
    }

    clear() {
        this.plateItem.remove();
    }

    removePlate() {
        this.plateItem.remove();
    }

    waitForMoveEnd() {
        return new Promise(resolve => {
            this.plateItem.addEventListener("transitionend", resolve, { once: true });
        });
    }

    waitForAnimationEnd() {
        return new Promise(resolve => {
          this.plateItem.addEventListener("animationend", resolve, { once: true });
        });
    }

}
