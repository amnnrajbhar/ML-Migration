import { RFCSTOMaterial } from "./rfcstomaterial.model";

export class RFCSTOHeader {
    mandt: string
    trntyp: string//Type 'STO','SALES'
    docyr: string//Year
    docno: string//InvoiceNo
    exdat: string//InvoiceDate
    bukrs: string//Company
    werks: string//suppling Plant
    rcwrk:string;//receiving Plant
    eI_DCNO: string//DCNO
    eI_BLDAT: string//DCDate
    eI_CUSTOMER: string//Customer
    eI_CITY: string
    eI_COUNTRY: string
    eI_REGION: string
    eI_ANZPK: string//No of Packages
    type: string
    message: string
    gestoitems:RFCSTOMaterial[]=[];
}