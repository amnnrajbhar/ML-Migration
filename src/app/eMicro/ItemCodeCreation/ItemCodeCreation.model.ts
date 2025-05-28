import { WorkFlowApprovers } from "../Masters/WorkFlowApprovers/WorkFlowApprovers.model";
import { Serialization } from "./Serialization.model";

export class ItemCodeRequest {
    id!: number;
    requestNo:  string;
    requestDate: string
    locationId: string
    storageLocationId: string
    materialTypeId: string
    materialShortName: string
    materialLongName: string
    materialGroupId: string
    pharmacopName: string
    pharmacopGrade: string
    genericName: string
    synonym: string
    pharmacopSpecification: string
    isDmfMaterial: string
    dmfGradeId:  number;
    materialGrade: string
    cosGradeAndNo: string
    additionalTest: string
    countryId: string
    customerName: string
    toBeUsedInProducts: string
    isVendorSpecificMaterial: string
    mfgrName: string
    siteOfManufacture: string
    tempCondition: string
    storageCondition: string
    shelfLife:  number;
    shelfLifeType: string
    dutyElement: string
    retestDays:  number;
    retestDaysType: string
    valuationClass: string
    approximateValue: string
    unitOfMeasId: string
    salesUnitOfMeasId: string
    purchaseGroupId: string
    sapCodeNo: string
    sapCodeExists: string
    sapCreationDate:string;
    sapCreatedBy: string
    requestedBy: string
    createdDate: string
    createdBy: string
    modifiedDate: string
    modifiedBy: string
    attachements: string
    type: string
    packingMaterialGroup: string
    typeOfMaterial: string
    artworkNo: string
    isArtworkRevision: string
    existingSapItemCode: string
    fgSapProductCode: string
    standardBatchSize:  number;
    stdBatchSizeUom: string
    batchCode: string
    mfrNo: string
    mfrDate: string
    targetWeight!: number;
    saleableOrSample: string
    domesticOrExports: string
    salesPackId: string
    packTypeId: string
    divisionId: string
    therapeuticSegmentId: string
    brandId: string
    strengthId: string
    prodInspMemo: string
    grossWeight:  number;
    netWeight:  number;
    weightUom: string
    dimension: string
    materialUsedIn: string
    isEquipment: string
    isSpare: string
    isNew: string
    isNewEquipment: string
    isNewFurniture: string
    isNewFacility: string
    isSpareRequired: string
    equipmentName: string
    equipmentMake: string
    componentMake: string
    oemPartNo: string
    prNumber: string
    poNumber: string
    utilizingDept: string
    detailedJustification: string
    purposeId:  number;
    isSasFormAvailable: string
    serviceCateId: string
    machineName: string
    manufacturedAt: string
    detailedSpecification: string
    approveType: string
    url: string
    reportUrl: string
    reasonType: string
    existingItemCode: string
    approveDate: string
    lastApprover: string
    pendingApprover: string
    taxClassification: string
    materialPricing: string
    packSize: string
    isAsset: string
    moc: string
    rating: string
    range: string
    ejectedFlag: string
    messageType: string
    recordStatus: string
    equipIntended: string
    storage: string
    sapStatus: string
    sapApprovedDate: string
    sapMessage: string
    sapAppStatus: string
    message: string
    sapMaterialCodeLists: string
    sapCosGradeNo: string
    sapDutyElement: string
    sapMfgrName: string
    sapSiteOfManufacture: string
    itemAvailable: string
    specificationNo: string
    matchSpecification: string
    specificationAdditionalTest: string
    existDmfno: string
    availableDmf: string
    itemFromMultipleVendors: string
    requiredDmf: string
    itemspecificVendor: string
    vendorReqMatch: string
    reqMeetVendorReq: string
    existLegacyCode: string
    newLegacyCode: string
    company: string
    qcSpecification: string
    firstAlphaRaw: string
    reasonForrequisition: string
    hsnCode: string
    sapMaterialTypeId: string
    reasonForRevision: string
    existingSapDescription: string
    revisedArtworkCode: string
    apiName: string
    apiVendorName: string
    manufactureAddress: string
    vendorSpecific: string
    excepientsDetails: string
    market: string
    productName: string
    qualitycomplyspecification: string
    itemCodeProposed: string
    itemCodeExisting: string
    excipientsCheck: string
    immediatePackMatCheck: string
    immediatePackMat: string
    manufactMatch: string
    manufacturingFormula: string
    punchesOrDiesMatch: string
    punchesOrDies: string
    testingSpecMatch: string
    testingSpecification: string
    sameMarCustCount: string
    productMatch: string
    marketCustCount: string
    finishedProductCode: string
    role: string
    sapCodeExistCore: string
    sapCodeExistCoated: string
    sapCodeCore: string
    sapCodeCoated: string
    targetWeightCore: string
    targetWeightCoated: string
    isCoated: string
    newCustomerName: string
    newPackSize: string
    specialApi: string
    serializationType: string
    serializedFromDate: string
    globalSerReq: string
    sapStatusFlag:  number;
    molecules:string;
    artWorkValidity:string;

    approver1:string;
    approver2:string;
    approver3:string;
    approver4:string;
    approver5:string;
    globalSerializationViewModel:Serialization[]=[];
    requests:any[]=[];
    vendorDetails:string;

    appArtAttachment:string;
	colArtAttachment:string;
	diaAttachment:string;
	shadeCardAttachment:string;

    tempCondition_other: string
    storageCondition_other: string

    expVendordetails:any[]=[];
    isSelected:boolean;

    totalCount!: number;
    totalPages!: number;
    
    approvers: WorkFlowApprovers[];
}