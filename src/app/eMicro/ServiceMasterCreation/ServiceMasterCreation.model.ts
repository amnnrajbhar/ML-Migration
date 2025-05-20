import { WorkFlowApprovers } from "../Masters/WorkFlowApprovers/WorkFlowApprovers.model";

export class ServiceMaster {
  id: number;
  requestNo: string;
  plantCode: string;
  storageLocation: string;
  serviceDescription: string;
  detailedDesc: string;
  sacCode: string;
  uom: string;
  purchaseGroup: string;
  serviceCatagory: string;
  serviceGroup: string;
  machineName: string;
  appValue: string;
  whereUsed: string;
  purpose: string;
  justification: string;
  valuationClass: string;
  attachment: string;
  appSatus: string;
  requestDate: string;
  requestedBy: string;
  approveDate: string;
  sapCodeNo: string;
  sapCodeExists: true;
  sapCreationDate: string;
  sapCreatedBy: string;
  createdDate: string;
  createdBy: string;
  lastApprover: string;
  pendingApprover: string;
  rejectedFlag: string;
  modifiedDate: string;
  modifiedBy: string;

  approver1: string;
  approver2: string;
  approver3: string;
  approver4: string;
  isSelected: boolean;

  approvers: WorkFlowApprovers[];
}