export class Square {
    constructor (fieldItem, x, y) {
        const square = document.createElement("div");
        square.classList.add("square");
        fieldItem.append(square);
        this.x = x;
        this.y = y;
    }

    linkPlate(plate) {
        plate.setCoordinate(this.x, this.y);
        this.linkedPlate = plate;
    }

    unlinkPlate() {
        this.linkedPlate = null;
    }

    isEmpty() {
        return !this.linkedPlate;
    }

    linkNewPlate(plate) {
        plate.setCoordinate(this.x, this.y);
        this.linkedNewPlate = plate;
    }

    unlinkNewPlate() {
        this.linkedNewPlate = null;
    }

    hasNewPlate() {
      return !!this.linkedNewPlate;
    }

    canMake(newPlate) {
      return this.isEmpty() || (!this.hasNewPlate() && this.linkedPlate.number === newPlate.number);
    }

    mergePlates() {
        const mergedValue = this.linkedPlate.number + this.linkedNewPlate.number;
        this.linkedPlate.setStyle(mergedValue);
        this.linkedNewPlate.removePlate();
        this.unlinkNewPlate();

        updateScore(mergedValue);
    }

}