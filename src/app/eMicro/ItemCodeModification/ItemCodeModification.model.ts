export class ItemCodeModification {
    id!: number;
  requestNo: string
  requestDate: string
  requestedBy: string
  itemCode: string
  subject: string
  description: string
  lastApprover: string
  pendingApprover: string
  pendingApproverName: string
  status: string
  createdBy: string
  createdOn: string
  modifiedBy: string
  modifiedOn: string

  materialLongName:string;
  materialShortName:string;
  materialGroupId:string;
  materialTypeId:string;
  attachments:string;

  approver1: string
  approver2: string
  approver3: string
  approver4: string
  approver5: string
}