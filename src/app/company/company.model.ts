export class Company {
    constructor(
        public id: number,
        public cmpid: number,
        public name: string,
        public legalName: string,
        public type: string,
        public email: string,
        public primaryContactNo: string,
        public address: string,
        public countryCode: string,
        public countryName: string,
        public stateCode: string,
        public stateName: string,
        public city: string,
        public postalCode: string,
        public contactNumber: string,
        public webSite: string,
        public createdBy: number,
        public approvedBy: number,
        public modifiedBy: number,
        public gstn: string,
        public pan: string,
        public activationDate: number,
        public validTillDate: number,
        public totalLicenses: number,
        public usedLicense: number,
        public remainingLicense: number,
        public isActive: boolean,
        public domainName: string
            ) { }
       
}
