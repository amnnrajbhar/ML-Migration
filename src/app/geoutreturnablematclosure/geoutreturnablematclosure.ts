export class GEOutRetMatClosure{
    constructor(
        public id : number, 
        public fKGateNoID : number, 
        public goNumber : string,
        public fromLocation : string,
        public destPlantId : string,
        public sendingPerson : string,
        public sendingDepartment : string,
        public exptOutTime : string,
        public dcNo : string,
        public dcDate : string, 
        public fy : string,
        public inwardTime : string,
        public exerciseNo : string,
        public exerciseDate : string, 
        public isActive : boolean,
        public inDate : string, 
        public vehicleNo : string
    ){}
}