import { RFCSCMaterial } from "./rfcscmaterial.model";

export class RFCSCHeader {
    mD_BLDAT: string //DOC Date
    mD_CITY: string
    mD_COUNTRY: string
    mD_REGION: string
    mD_VENDOR: string//Sub-Contractor
    type: string
    message: string
    geSubContITEMS:RFCSCMaterial[]=[];
}