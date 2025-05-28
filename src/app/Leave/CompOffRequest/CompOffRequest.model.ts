export class CompOffRequest {
  id!: number;
  reqNo!: number;
  fromDate: string
  toDate: string
  pernr!: number;
  noHrs!: number;
  applicabale: string
  apprvrStatus: string
  requestedBy: string
  requestedDate: string
  apprvdDate: string
  reason: string
  sapReqNo!: number;
  sapApproved!: boolean;
  compAvailed!: boolean;
  compLapsed!: boolean;
  lapsBydate: string
  nofDaysRemaining!: number;
  sapUpdated: string
  sapMessage: string
  sapUpdatedDate: string
  sapPrevDate: string
  lastApprover: string
  pendingApprover: string
  compType: string
  shift:string;
  cancelflag!: number;
  location: string
  typ: string
  message: string
}