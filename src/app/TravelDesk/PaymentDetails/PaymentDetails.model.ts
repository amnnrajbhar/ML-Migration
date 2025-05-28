export class PaymentDetails{
    id:number;
    chequeNo:number;
    chequeDate:Date;
    chequeAmount:number;
    chequeIssuedTo:string;
    accSubmittedReferenceNoId:number;
   totalAmount:number;
   advanceAmountPaid:number; 
   balanceAmount:number;
   advanceChequeNo:number;
   remarks :string;
   accSubmittedBy:number;
   accSubmittedDate:Date;
   supportings:string;
   division:string;
   department:string;
   typeOfEvent:string;
   typeOfGuest:string;
   vendorName:string;
   invoiceNo:number;
   invoiceDate:string;
   createdDate:string;
   createdBy!: number;
   modifiedBy!: number;
  isSelected!: boolean;
    
}