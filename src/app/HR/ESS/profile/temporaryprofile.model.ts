export interface TemporaryProfile{

    profileId:number;
	employeeId:number;
	officialDetails:string[];
	addressDetails:string[];
	educationDetails:string[];
	experienceDetails:string[];
	familyDetails:string[];
	languageDetails:string[];
	assetDetails:any[];
	status:string;
	createdById:number;
	createdDate:Date;
	createdBy:string;
	modifiedById:number;
	modifiedByDate:Date;
	action:string;
	reasonForUpload:string;
    }
