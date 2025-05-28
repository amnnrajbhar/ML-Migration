import { GateOutwardD } from "./gateoutwardd.model";

export class GateOutwardMaster {
    id!: number;
    mandt: string
    fiN_YEAR: string
    planT_ID: string
    gO_GATENO: string
    gO_NO: string
    gO_TYPE: string
    gO_DATE: any;
    exP_RETURN_DATE: any;
    sendinG_DEPT_NM: string
    sendinG_PERSON: string
    sendingPersonName: string
    sendinG_REASON: string
    dC_NO: string
    dC_DATE: any;
    doC_NO: string
    doC_DATE: any;
    destinatioN_NM: string
    deliverymode: string
    deliveryperson: string
    courier_Name: string
    courier_Num: string
    courier_Date: any;
    vehicleno: string
    ouT_TIME: any;
    ouT_DATE: any;
    exP_OUT_TIME: any;
    persoN_NAME: string
    gO_FLG: string
    deL_FLG: string
    deL_REASON: string
    createD_BY: string
    createD_DATE: any;
    modifieD_BY: string
    modifieD_DATE: any;
    deleteD_BY: string
    deleteD_DATE: any;
    remarks: string
    isActive!: boolean;
    recid: string
    comments:string;
    gateOutwardDViewModel: GateOutwardD[] = [];

    iteM_NO!: number;
    iteM_CODE: string
    materiaL_TYPE: string
    iteM_DESC: string
    uom: string
    nO_OF_CASES!: number;
    qty!: number;
    
    transporterName:string;
    lrNo:string;
    driverName:string;

    status:string;
    pendingWith:string;
    pendingWithName: string
    approvedBy:string;
    isSelected:boolean;
}