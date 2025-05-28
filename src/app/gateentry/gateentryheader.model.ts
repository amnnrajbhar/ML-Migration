import { GateEntryMaterial } from "./gateentrymaterial.model";

export class GateEntryHeader {
    compL_DLV: string
    cO_CODE: string
    createD_BY: string
    createD_ON: string
    customer: string
    deletE_IND: string
    doC_CAT: string
    doC_DATE: string //PO DATE
    doC_TYPE: string
    geMaterialPO: GateEntryMaterial[] = []; //Material List
    iteM_INTVL: string
    lanD1: string //Country Code
    landx: string //Country
    lasT_ITEM: string
    message: string
    orT01: string //Supplier Place
    pO_NUMBER: string
    purcH_ORG: string
    puR_GROUP: string
    status: string
    suppL_VEND: string
    telephone: string
    type: string //Success-S/Error-E/Warn- W
    vendor: string //Supplier Code
    venD_NAME: string //Supplier Name
    vpeR_END: string
    vpeR_START: string
}