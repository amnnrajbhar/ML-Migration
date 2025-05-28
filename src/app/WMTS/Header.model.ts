import { LineItem } from "./Lineitem.model";

export class Header {

    destStorageBin: string
    destStorageSection: string
    destStorageType: string
    docDate: string
    freightType: string
    grossWeight: string
    lrDate: string
    lrNo: string
    lotContainer: string
    modeofTransport: string
    netWeight: string
    noOfVehicles: string
    postingDate: string
    qmNoOfContainers: string
    refDocNo: string
    remarks: string
    supplierCode: string
    transactionType: string
    slNo:string;
    type: string
    message: string
    lineItems: LineItem[]=[];
    filteredstatusmodel:any[]=[];
    materialstatusmodel:any[]=[];
    samples:any[]=[];
    binModel:any[]=[];
    tracking:any={};
    postedBy:string;
    plant:string;
    matDocNo:string;
    typeOfReciept:string;
    dCNo:string;
}