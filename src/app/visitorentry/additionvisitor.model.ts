export class AdditionalVisitor{
    constructor(
        public id: number,
        public fkId: number,
        public name: string,
        public mobile: string,
        public email: string,
        public companyName: string,
        public date: string,
        public toTime: string,
        public fromTime: string,
        public createdBy: number,
        public createdDate: string,
        public modifiedBy: number,
        public modifiedDate: string,
        public temp10: string,
        public temp9: string,
        public temp8: string,
        public temp7: string,
        public temp6: string,
        public temp5: string,
        public temp4: string,
        public temp3: string,
        public temp2: string,
        public temp1: string,

        public fkEmployeeName: string,
        public numberOfPerson: number,

        public visitorPurpose: string,
        public dept: string
    ){}
}