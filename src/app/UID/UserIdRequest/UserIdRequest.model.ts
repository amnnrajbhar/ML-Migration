import { WorkFlowApprovers } from "../../eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.model";

export class UserIdRequest{
   
  id: number;
  requestNo: string;
  requestType: string;
  requestDate: string;
  locationId: number;
  sid: number;
  requesterId: string;
  onBehalfEmp: string;
  comments: string;
  releivedDate: string;
  isWorkItemsAssignedPending: number;
  isPendingWorkTransferred: number;
  catogery: string;
  presentRoleInQams: string;
  newRoleInQams: string;
  isInductionTrainingRequired: number;
  trainingRecordPath: string;
  dateOfTraining: string;
  jddocument: string;
  validFrom: string;
  temporaryPasswordConveyed: boolean;
  temporaryPassword: string;
  userActivated: boolean;
  userAddedToRequestedGroup: boolean;
  unlocking: boolean;
  discontinuation: boolean;
  userAddedToRequestedPlants: number;
  userAddedToSubGroup: number;
  userAddedToTheRequestedRepositoryDomain: number;
  jdIntiated: number;
  jdApproved: number;
  jdAcceptedByUser: number;
  emailIdUpdate: string;
  resetPassword: number;
  reasonForReset: string;
  userIdUnlock: boolean;
  reasonForUnlock: string;
  allottedUserId: string;

  requestfor:string;
  pendingApprover:string;
  lastApprover:string;
  modifiedBy:string;
  status:string;
  modifiedDate:string;
  createdBy:string;
  createdDate:string;
  assignedPlants:string;
  userGroups:string;
  userSubGroups:string;
  discontinuationId:string;
  newRoleUpdated:string;
  existingUserProfie:string;
  userProfiles:string;
  selProfiles:any[]=[];
  userModules:string;
  selModules:any[]=[];
  repositoryDomains:string;
  masterAssignment:string;
  selMasters:any[]=[];
  inAssistanceTrainingCoordinator:number;
  remarks:string;
  userIdModification:number;
  configuredCommunication:number;
  roleUpdated: number;
  passwordReset: number;
  selectedRoles:any[]=[];;
  selectedNewRoles:any[]=[];;

  approverId:string;
  name:string;
  employeeId:string;
  fullName:string;
  firstName:string;
  lastName:string;
  initial:string;
  staffCategory:string;
  payGroup:string;
  Desigrole:string;
  department:string;
  designation:string;
  reportingManager:string;
  joiningDate:string;
  plant:any;
  Approverslist:WorkFlowApprovers[]=[];
  softwareRolesList1:any[]=[];
  UserGroupsList1:any[]=[];
  UserSubGroupsList1:any[]=[];
  Plantsassigned:any[]=[];
  usergroupsList:any[]=[];
  usersubgroupsList:any[]=[];
  otherSubGroups:string;
  isActive:boolean;
  activity:string;
  computerizedSystemName:string;
  computerizedSystemId:string;
  departmentId:string;
  generalRole:string;
  existingId:string;
  selectedRepoDomains:any[]=[];

  requestsList:UserIdRequest[]=[];
  filesList:any[]=[];
  attachments:string;
  attachmentsList:any[]=[];

  software:string;
  role:string;
  salutation:string;
  updatedDesignation:string;
  updatedReporting: string;
  softwareType: string;


  adId: string;
  assetDetails: string;
  hostname: string;
  ipAddress: string;
  requiredSoftwares: string;
  email: string;
  mobileNo: string;
  reportingManagerEmail: string;
  prefferedEmail: string;
  allowOutsideComm: string;
  commonOrIndividualId: string;
  accessOnMobile: string;
  empType: string;
  emailBackup: string;
  accessType: string;
  folderAccessPath: string;
  accessDurtion: string;
  fileservername: string;
  licenseType: string;
  officeSuite: string;
  mailandTeamsAccess: string;
  vendorName: string;
  applicationName: string;
  serverList: string;
  ipType: string;
  noOfIps: string;
  usbFromDate: string;
  usbTodate: string;
  
}