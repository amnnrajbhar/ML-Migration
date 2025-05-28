export class MediServiceRequest {
  id!: number;
  requestNo: string
  requestDate: string
  location: string
  division: string
  category: string
  brand: string
  product: string
  details: string
  attachements: string
  submitedDate: string
  createdDate: string
  createdBy: string
  modifiedDate: string
  modifiedBy: string
  finalDocNo: string
  finalDocDate: string
  finalSerialNo: string
  apprvrStatus: string
  approveType: string
  stage: string
  approveDate: string
  lastApprover: string
  pendingApprover: string
  rejectedFlag: string
  revertVersion!: number;
  reviewerAssignFlag!: number;
  repeatFlag!: number;
  employeeId: string
  fullName: string
  department: string
  designation: string

  inputType: string

  isSelected: any;
  approverId: string     // To be removed
  penApproverId: string  // Not used anymore

  createdByDisplay: string
  pendingApproverName: string
  status: string
  comments: string
  lastApproverRole: string
  currentStage!: number;

  totalCount!: number;
  totalPages!: number;
}