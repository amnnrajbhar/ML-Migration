import { FNFSettlement } from './fnfsettlement.model';
export interface FNFDetails{

    fnfId:number;
    employeeId:number;
    status:string;
	payableDays:number;
	remarks:string;
    netAmt:number;
    submittedDate: Date;
	submittedToId: number;
	submittedToName: string
	receiptDate: Date;
	modeOfPayment: string
	bankName:string;	
	chequeDate: Date;
	chequeNo:string;	
	amount: number;
	modeOfIssue: string
	issueDate: Date;
	issuingPersonName: string
	issuingPersonMobile: string
	issuingPersonEmail: string
	personalEmailId: string
	carrierName: string
	docketno: string
	dispatchDate: Date;
	createdById: number;
	createdDate: Date;
	modifiedById: number;
	modifiedDate: Date;
	cl: number;
	ml: number;
	el: number;
	waivedOffDays: number;
	reason: string
	fnfSettlement: FNFSettlement[];
    }