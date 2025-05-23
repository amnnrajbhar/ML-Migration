export class RulesMaster {
  id: number;
  plant: number;
  paygroup: number;
  empcat: number;
  attendanceLateCount: number;
  permissionCount: number;
  leaveApplyAfter: string;
  odApplyAfter: string;
  applyPermissionAfter: string;
  applyForgotSwipe: string;
  applyPunchMissing: string;
  permissionCountType: string;
  isActive: boolean;
  createdBy: string;
  createdOn: string;
  modifiedBy: string;
  modifiedOn: string;
  deletedReason: string;
  attendanceStatusChangeCount: number;
  missingPunchesRequestCount: number;
  perMinPerMonth: number;
  PermissionCount: number;
  permissionCountPerMonth: number;
  perInMinMinutes: number;
  perInMaxMinitues: number;
  pMinimumMin: number;
  pMaxMin: number;
  shiftCode: string;
  availFlexiHours: boolean;
  flexiStartTime: any;
  workHours: string;
  shiftAllowance: boolean;
  allowanceAmount: string;
  payGroupName: string;
  auditType: any;
  lopReimbursement: number;
  AllShiftList: any[]= [];
}