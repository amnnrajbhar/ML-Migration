export class GEOutward{
    constructor(
        public id	: number,
        public fkGateNoID	: number,
        public withPO :	boolean,
        public pO_No	: string,
        public dC_No	: string,
        public dC_Date	: string,
        public date	: string,
        public fy	: string,
        public department	: string,
        public materialType	: string,
        public sendingPerson	: string,
        public destination	: string,
        public vehicleNo	: string,
        public exptOutTime	: string,
        public outDate	: string,
        public outTime	: string,
        public isActive :	boolean

    ){}
}