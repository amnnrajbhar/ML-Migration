export class GEOutwardMaterial{
    constructor(
        public id	: number,
        public fkGe_In_Id	: number,
        public materialCode	: string,
        public materialDescription	: string,
        public uom	: string,
        public qty	: number,
        public qtyReceived	: number,
        public isActive :	boolean
    ){}
}