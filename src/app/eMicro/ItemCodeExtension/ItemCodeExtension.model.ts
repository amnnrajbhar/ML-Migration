export class ItemCodeExtension {
    id: number
    requestNo: string
    requestDate: string
    type: string
    plant1: string
    materialCode1: string
    extendedToPlant1: string
    storageLocationId1: string
    extendedStorageLocation1: string
    plant2: string
    materialCode2: string
    fromStorageLocation: string
    toStorageLocation: string
    createdDate: string
    createdBy: string
    modifiedDate: string
    modifiedBy: string
    approveType: string
    approveDate: string
    lastApprover: string
    pendingApprover: string
    existingSapNo: string
    rejectedFlag: string
    materialShortName: string
    hsnCode: string
    sapcreaterFlag: string
    attachments: string
    reason: string
    materialTypeId:string;

    codeExtendedBy:string;
    codeExtendedOn:string;

    pendingPriority!: number;
}