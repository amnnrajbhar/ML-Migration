import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth-guard.service';
import { InitPageComponent } from './initiallogin/initpage.component';
import { CalendarComponent } from './masters/calendar/calendar.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageboardComponent } from './pageboard/pageboard.component';
import { EditContractEmployeeComponent } from './EditContractEmployee/EditContractEmployee.component';
import { ViewContractEmployeeComponent } from './ViewContractEmployee/ViewContractEmployee.component';
import { ESSModule } from './HR/ESS/ess.module';
import { EmployeeModule } from './HR/Employee/employee.module';
import { OffersModule } from './HR/Offer/offers.module';
import { ActionsModule } from './HR/actions/actions.module';
import { AppointmentModule } from './HR/appointment/appointment.module';
import { ChecklistModule } from './HR/checklist/checklist.module';
import { ConfigModule } from './HR/config/config.module';
import { ConfirmationModule } from './HR/confirmation/confirmation.module';
import { FnFModule } from './HR/fnf/fnf.module';
import { AdminModule } from './HR/admin/admin.module';
import { RecallModule } from './HR/recall/recall.module';
import { RetirementModule } from './HR/retirement/retirement.module';
import { SeparationModule } from './HR/separation/separation.module';
import { TerminationModule } from './HR/termination/termination.module';
import { TransferModule } from './HR/transfer/transfer.module';
import { HomepageComponent } from './homepage/homepage.component';

const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },

    { path: 'forgotpassword', loadChildren: './auth/forgotpassword/forgotpassword.module#ForgotpasswordModule' },

    { path: '', canActivate: [AuthGuard], pathMatch: 'full', redirectTo: 'initpage' },
    { path: 'initpage', component: InitPageComponent, canActivate: [AuthGuard] },

    { path: 'msgBoard', loadChildren: './messageboard/messageboard.module#MessageboardModule' },
    // { path: 'employee', loadChildren: './masters/employee/employee.module#EmployeeModule' },
    { path: 'employee', loadChildren: './masters/EmployeeMaster/EmployeeMaster.module#EmployeeMasterModule' },
    { path: 'addprofile', loadChildren: './profile/add-profile/add-profile.module#AddProfileModule' },
    { path: 'addrole', loadChildren: './profile/add-role/add-role.module#AddRoleModule' },
    { path: 'department', loadChildren: './profile/department/department.module#DepartmentModule' },
    { path: 'profile', loadChildren: './profile/profile.module#ProfileModule' },
    { path: 'company', loadChildren: './company/company.module#CompanyModule' },

    { path: 'calendar', loadChildren: './masters/calendar/calendar.module#CalendarModule' },
    { path: 'visitortype', loadChildren: './masters/visitortype/visitortype.module#VisitorTypeModule' },
    { path: 'purpose', loadChildren: './masters/purpose/purpose.module#PurposeModule' },
    { path: 'belongings', loadChildren: './masters/belongings/belongings.module#BelongingsModule' },
    { path: 'locationmaster', loadChildren: './masters/locationmaster/locationmaster.module#LocationMasterModule' },
    { path: 'mailconfig', loadChildren: './masters/mailconfiguration/mailconfiguration.module#MailconfigurationModule' },
    { path: 'passwordpolicy', loadChildren: './masters/passwordpolicy/passwordpolicy.module#PasswordpolicyModule' },

    { path: 'reports', loadChildren: './reports/reports.module#ReportsModule' },
    { path: 'divreports', loadChildren: './reports/divreport/divreport.module#DivreportModule' },
    { path: 'logcomplaint', loadChildren: './feedback/feedback.module#FeedbackModule' },
    { path: 'resolvecomplaint', loadChildren: './feedback/resolve-complaint/resolve-complaint.module#ResolveComplaintModule' },

    //GateEntry

    { path: 'gesentry', loadChildren: './gateentry/gateentry.module#GateentryModule' },
    { path: 'gesentrywithoutpo', loadChildren: './gateentrywithoutpo/gateentrywithoutpo.module#GateentryWithoutPOModule' },
    { path: 'geinreturnmat', loadChildren: './geinreturnablemat/geinreturnablemat.module#GEInReturnableMatModule' },
    { path: 'geinstocktransfer', loadChildren: './geinstocktransfer/geinstocktransfer.module#GEInStockTransferModule' },
    { path: 'geinsubcontracting', loadChildren: './geinsubcontracting/geinsubcontracting.module#GEInSubContractingModule' },

    { path: 'geoutothermat', loadChildren: './geoutothermat/geoutothermat.module#GEOutOtherMaterialModule' },
    { path: 'geoutothermatsecurity', loadChildren: './geoutothermatsecurity/geoutothermatsecurity.module#GeOutOtherMaterialSecurityModule' },
    { path: 'geoutexciseinvoice', loadChildren: './geoutexciseinvoice/geoutexciseinvoice.module#GEOutExciseInvoiceModule' },
    { path: 'geoutexciseinvoicesecurity', loadChildren: './geoutexciseinvoicesecurity/geoutexciseinvoicesecurity.module#GeoutexciseinvoicesecurityModule' },
    { path: 'geoutsubcontracting', loadChildren: './geoutsubcontracting/geoutsubcontracting.module#GEOutSubContractingModule' },
    { path: 'geoutsubcontractsecurity', loadChildren: './geoutsubcontractsecurity/geoutsubcontractsecurity.module#GeoutsubcontractsecurityModule' },
    { path: 'geoutstocktransfer', loadChildren: './geoutstocktransfer/geoutstocktransfer.module#GEOutStockTransferModule' },
    { path: 'geoutstocktransfersecurity', loadChildren: './geoutstocktransfersecurity/geoutstocktransfersecurity.module#GeoutstocktransfersecurityModule' },
    { path: 'geoutreturnablematclosure', loadChildren: './geoutreturnablematclosure/geoutreturnablematclosure.module#GEOutRetMatClosureModule' },

    { path: 'geinregreport', loadChildren: './geinregreport/geinregreport.module#GEInwardRegReportModule' },
    { path: 'geoutregreport', loadChildren: './geoutregreport/geoutregreport.module#GEOutRegModule' },
    { path: 'gereturnclosurereport', loadChildren: './gereturnableclosurereport/gereturnableclosurereport.module#GereturnableclosurereportModule' },
    { path: 'gesubcontractreport', loadChildren: './gesubcontractreport/gesubcontractreport.module#GesubcontractreportModule' },

    { path: 'gesentryoutward', loadChildren: './gateentryoutward/gateentryoutward.module#GateentryOutwardModule' },
    { path: 'gesentrysearch', loadChildren: './gateentrysearch/gateentrysearch.module#GESearchModule' },
    { path: 'gevisitorpass', loadChildren: './gevisitorpass/gevisitorpass.module#GEVisiorPassModule' },
    { path: 'gesvisitorreport', loadChildren: './gatevisitorreport/gatevisitorreport.module#GateVisitorModule' },

    //Nagaraj B Changes
    { path: 'room-maintenance', loadChildren: './bookmeetingroom/room-maintenance/room-maintenance.module#RoomMaintenanceModule' },
    { path: 'book-room/:id', loadChildren: './bookmeetingroom/room-booking/room-booking.module#RoomBookingModule' },
    { path: 'roomfacilities-master', loadChildren: './bookmeetingroom/roomfacilities-master/roomfacilities.module#RoomfacilitiesModule' },
    { path: 'roomtype-master', loadChildren: './bookmeetingroom/roomtype-master/roomtype-master.module#RoomtypeMasterModule' },
    { path: 'adminapproval', loadChildren: './bookmeetingroom/adminapproval/adminapproval.module#AdminapprovalModule' },
    { path: 'book-room', loadChildren: './bookmeetingroom/book-room/book-room.module#BookRoomModule' },
    { path: 'booking-purpose', loadChildren: './bookmeetingroom/booking-purpose/booking-purpose.module#BookingPurposeModule' },
    { path: 'managerapproval', loadChildren: './bookmeetingroom/managerapproval/managerapproval.module#ManagerapprovalModule' },
    { path: 'mymeetings', loadChildren: './bookmeetingroom/mymeetings/mymeetings.module#MymeetingsModule' },
    { path: 'booking-report', loadChildren: './booking-report/booking-report.module#bookingreportModule' },
    { path: 'cabbooking-report', loadChildren: './cabbooking-report/cabbooking-report.module#cabbookingreportModule' },
    { path: 'book-cab', loadChildren: './cabrequest/book-cab/book-cab.module#BookCabModule' },
    { path: 'cab-adminapproval', loadChildren: './cabrequest/cab-adminapproval/cab-adminapproval.module#CabAdminapprovalModule' },
    { path: 'cab-managerapproval', loadChildren: './cabrequest/cab-managerapproval/cab-managerapproval.module#CabManagerapprovalModule' },
    { path: 'book-guesthouse', loadChildren: './guest-house/book-guesthouse/book-guesthouse.module#BookGuesthouseModule' },
    { path: 'gh-adminapproval', loadChildren: './guest-house/gh-adminapproval/gh-adminapproval.module#GhAdminapprovalModule' },
    { path: 'gh-managerapproval', loadChildren: './guest-house/gh-managerapproval/gh-managerapproval.module#GhManagerapprovalModule' },
    { path: 'gh-report', loadChildren: './guest-house/gh-report/gh-report.module#GhReportModule' },
    { path: 'guesthouse-facilities', loadChildren: './guest-house/guesthouse-facilities/guesthouse-facilities.module#GuesthouseFacilitiesModule' },
    { path: 'gh-location', loadChildren: './guest-house/guesthouse-location/guesthouse-location.module#GuesthouseLocationModule' },
    { path: 'audit-report', loadChildren: './auditlogreport/auditlogreport.module#AuditlogreportModule' },
    { path: 'mybookings', loadChildren: './guest-house/mybookings/mybookings.module#MybookingsModule' },
    { path: 'guesthouse-maintenance', loadChildren: './guest-house/guesthouse-maintenance/guesthouse-maintenance.module#GuesthouseMaintenanceModule' },
    { path: 'changepassword', loadChildren: './auth/changepassword/changepassword.module#ChangepasswordModule' },
    { path: 'locationwiseReport', loadChildren: './locationreport/locationreport.module#LocationreportModule' },
    { path: 'dashboard-emp', loadChildren: './dashboard/dashboard.module#DashboardModule' },
    { path: 'visitorappointment', loadChildren: './visitorappointment/visitorappointment.module#VisitorappointmentModule' },
    // { path: 'visitorentry',  loadChildren: './visitorentry/visitorentry.module#VisitorentryModule'},
    { path: 'resetpassword', loadChildren: './auth/resetpassword/resetpassword.module#ResetPasswordModule' },
    { path: 'testpage', loadChildren: './testpage/testpage.module#TestpageModule' },
    { path: 'assessmentReport', loadChildren: './editing/assessmentmasterreport/assessmentmasterreport.module#AssessmentmasterreportModule' },
    { path: 'generalReport', loadChildren: './editing/generalreport/generalreport.module#GeneralreportModule' },
    { path: 'noduepage', loadChildren: './noduepage/noduepage.module#NoduepageModule' },
    { path: 'autoComplete', loadChildren: './autocomplete/autocomplete.module#AutocompleteModule' },

    { path: 'UserplantMaint', loadChildren: './UserPlantAssignment/UserPlantAssignment.module#UserPlantAssignmentModule' },

    //RA
    { path: 'Rarequest', loadChildren: './RaRequest/RaRequest.module#RaRequestModule' },

    { path: 'visitorentry', loadChildren: './visitorentry/visitorentry.module#VisitorentryModule' },
     //{ path: 'vms-homepage', component: PageboardComponent, canActivate: [AuthGuard] },
   { path: 'vms-homepage', component: HomepageComponent, canActivate: [AuthGuard] },
    { path: 'profile-page', loadChildren: './profile-page/profile-page.module#ProfilePageModule' },
    { path: 'welcome-page', loadChildren: './welcome-page/welcome-page.module#WelcomePageModule' },
    { path: 'welcome-page/:type', loadChildren: './visitorentry/visitorentry.module#VisitorentryModule' },

    { path: 'competency', loadChildren: './masters/competency/competency.module#CompetencyModule' },
    { path: 'designation', loadChildren: './masters/designation/designation.module#DesignationModule' },
    { path: 'sbu', loadChildren: './masters/sbu/sbu.module#SbuModule' },
    { path: 'material', loadChildren: './masters/material/material.module#MaterialModule' },
    { path: 'materialmaster', loadChildren: './masters/materialmaster/materialmaster.module#MaterialmasterModule' },
    { path: 'uom', loadChildren: './masters/uom/uom.module#UomModule' },
    { path: 'mail', loadChildren: './masters/mail/mail.module#MailModule' },
    { path: 'bellcurve', loadChildren: './masters/bellcurve/bellcurve.module#BellcurveModule' },
    { path: 'project', loadChildren: './masters/project/project.module#ProjectModule' },
    { path: 'rating', loadChildren: './masters/rating/rating.module#RatingModule' },
    { path: 'softskill', loadChildren: './masters/softskill/softskill.module#SoftSkillModule' },

    //JobWork
    { path: 'JWDC', loadChildren: './Jobwork/jobwork.module#JobWorkModule' },

    { path: 'passwordreset', loadChildren: './auth/PasswordReset/PasswordReset.module#PasswordResetModule' },
    //Medical&NPD

    { path: 'MediRequest', loadChildren: './MedicalServices/MediServiceRequest/MediServiceRequest.module#MediServiceRequestModule' },
    { path: 'NPDRequest', loadChildren: './NPD/NPDRequest/NPDRequest.module#NPDRequestModule' },
    { path: 'MediDashboard', loadChildren: './MedicalServices/Dashboard/dashboard.module#DashboardModule' },
    { path: 'NPDDashboard', loadChildren: './NPD/Dashboard/dashboard.module#DashboardModule' },


    //lockout
    { path: 'Lockout', loadChildren: './auth/Unlockuser/Unlockuser.module#UnlockuserModule' },

    //eMicroModules
    { path: 'materialgroup', loadChildren: './eMicro/Masters/MaterialGroup/MaterialGroup.module#MaterialGroupModule' },
    { path: 'storagelocation', loadChildren: './eMicro/Masters/StorageLocation/StorageLocation.module#StorageLocationModule' },
    { path: 'processmaster', loadChildren: './eMicro/Masters/ProcessMaster/ProcessMaster.module#ProcessMasterModule' },
    { path: 'itemcodecreation', loadChildren: './eMicro/ItemCodeCreation/ItemCodeCreation.module#ItemCodeCreationModule' },
    { path: 'country', loadChildren: './eMicro/Masters/Country/Country.module#CountryModule' },
    { path: 'PharmaGrade', loadChildren: './eMicro/Masters/PharmacopeialGrade/PharmacopeialGrade.module#PharmaGradeModule' },
    { path: 'dmfgrade', loadChildren: './eMicro/Masters/dmfgrademaster/dmfgrademaster.module#DmfGradeModule' },
    { path: 'tempcondition', loadChildren: './eMicro/Masters/tempcondition/tempcondition.module#TempConditionModule' },
    { path: 'storagecondition', loadChildren: './eMicro/Masters/storagecondition/storagecondition.module#StorageConditionModule' },
    { path: 'strength', loadChildren: './eMicro/Masters/strength/strength.module#StrengthModule' },
    { path: 'brand', loadChildren: './eMicro/Masters/brand/brand.module#BrandModule' },
    { path: 'division', loadChildren: './eMicro/Masters/division/division.module#DivisionModule' },
    { path: 'genericname', loadChildren: './eMicro/Masters/genericname/genericname.module#GenericNameModule' },
    { path: 'packsize', loadChildren: './eMicro/Masters/packsize/packsize.module#PackSizeModule' },
    { path: 'packtype', loadChildren: './eMicro/Masters/packtype/packtype.module#PackTypeModule' },
    { path: 'valuationclass', loadChildren: './eMicro/Masters/valuationclass/valuationclass.module#ValuationClassModule' },
    { path: 'approvers', loadChildren: './eMicro/Masters/WorkFlowApprovers/WorkFlowApprovers.module#WorkFlowApproversModule' },

    { path: 'itemcodeextension', loadChildren: './eMicro/ItemCodeExtension/ItemCodeExtension.module#ItemCodeExtensionModule' },
    { path: 'servicemaster', loadChildren: './eMicro/ServiceMasterCreation/ServiceMasterCreation.module#ServiceMasterModule' },
    { path: 'customermaster', loadChildren: './eMicro/CustomerMaster/CustomerMaster.module#CustomerMasterModule' },
    { path: 'vendormaster', loadChildren: './eMicro/VendorMaster/VendorMaster.module#VendorMasterModule' },
    { path: 'sap_reports', loadChildren: './eMicro/Reports/Reports.module#ReportsModule' },
    { path: 'masscodecreation', loadChildren: './eMicro/Masscodecreation/Masscodecreation.module#MassCodeCreationModule' },
    { path: 'Dashboard', loadChildren: './eMicro/DashBoard/Dashboard.module#DashboardModule' },
    { path: 'DetailedReport', loadChildren: './eMicro/DetailedReport/DetailedReport.module#DetailedReportModule' },
    { path: 'Modification', loadChildren: './eMicro/ItemCodeModification/ItemCodeModification.module#ItemCodeModificationModule' },


    // PrintLogReport
    { path: 'PrintLogReport', loadChildren: './eMicro/PrintLogReport/PrintLogReport.module#PrintLogReportModule' },

    //UID
    { path: 'userIdRequest', loadChildren: './UID/UserIdRequest/UserIdRequest.module#UserIdRequestModule' },
    { path: 'softwaremaster', loadChildren: './UID/Softwaremaster/Softwaremaster.module#SoftwareMasterModule' },
    { path: 'softwarerolemaster', loadChildren: './UID/SofwareRoles/SofwareRoles.module#SofwareRolesModule' },
    { path: 'usergroupmaster', loadChildren: './UID/UserGroups/UserGroups.module#UserGroupsMasterModule' },
    { path: 'usersubgroupmaster', loadChildren: './UID/UserSubGroups/UserSubGroups.module#UserSubGroupsMasterModule' },
    { path: 'softwaremodules', loadChildren: './UID/SoftwareModules/SoftwareModules.module#SoftwareModulesMasterModule' },
    { path: 'softwareUserProfiles', loadChildren: './UID/SoftwareUserProfiles/SoftwareUserProfiles.module#SoftwareProfilesModule' },
    { path: 'RepositoryDomains', loadChildren: './UID/RepositoryDomains/RepositoryDomains.module#RepositoryDomainsModule' },
    { path: 'UserplantMaint', loadChildren: './UserPlantAssignment/UserPlantAssignment.module#UserPlantAssignmentModule' },
    { path: 'userIdRequestReport', loadChildren: './UID/UserIdRequestReport/UserIdRequestReport.module#UserIdRequestReportModule' },


    { path: 'creatorSummary', loadChildren: './eMicro/CodeCreatorsSummaryReport/CodeCreatorsSummaryReport.module#CodeCreatorsSummaryReportModule' },
    { path: 'creatorSummaryMail', loadChildren: './eMicro/CodeCreatorsSummaryReportMail/CodeCreatorsSummaryReportMail.module#CodeCreatorsSummaryReportMailModule' },
  { path: 'ContractEmployee', loadChildren: './ContractEmployee/ContractEmployee.module#ContractEmployeeModule' },
  { path: 'ContractEmployeeList', loadChildren: './ContractEmployeeList/ContractEmployeeList.module#ContractEmployeeListModule' },
  { path: 'EditContractEmployee/:id', component: EditContractEmployeeComponent, canActivate: [AuthGuard] },
  { path: 'ViewContractEmployee/:id', component: ViewContractEmployeeComponent, canActivate: [AuthGuard] },
  { path: 'ApplyLeave', loadChildren: './Leave/ApplyLeave/ApplyLeave.module#ApplyLeaveModule' },
  { path: 'Holidays', loadChildren: './HolidaysMaster/HolidaysMaster.module#HolidaysMasterModule' },
  { path: 'WorkingCalendar', loadChildren: './WorkingCalendar/WorkingCalendar.module#WorkingCalendarModule' },
  { path: 'ShifMaster', loadChildren: './Leave/EmpShiftMaster/EmpShiftMaster.module#EmpShiftMasterModule' },
  { path: 'RulesMaster', loadChildren: './Leave/RulesMaster/RulesMaster.module#RulesMasterModule' },
  { path: 'shiftAssignment', loadChildren: './Leave/ShiftAssignment/ShiftAssignment.module#ShiftAssignmentModule' },
  { path: 'ShiftRegister', loadChildren: './Leave/ShiftRegister/ShiftRegister.module#ShiftRegisterModule' },
  { path: 'OnDutyRequest', loadChildren: './Leave/OnDutyRequest/OnDutyRequest.module#OnDutyRequestModule' },
  { path: 'MyApprovals', loadChildren: './Leave/MyApprovals/MyApprovals.module#MyApprovalsModule' },
  { path: 'Permission', loadChildren: './Leave/PermissionRequest/PermissionRequest.module#PermissionRequestModule' },
  { path: 'attendance', loadChildren: './Leave/Attendance/Attendance.module#AttendanceModule' },
  { path: 'OverTime', loadChildren: './Leave/OverTimeRequest/OverTimeRequest.module#OverTimeRequestModule' },
  { path: 'AttendanceProcessing', loadChildren: './Leave/AttendanceProcessing/AttendanceProcessing.module#AttendanceProcessingModule' },
  { path: 'ManualEntry', loadChildren: './Leave/ManualEntry/ManualEntry.module#ManualEntryModule' },
  { path: 'PayrollRegularization', loadChildren: './Leave/PayrollRegularization/PayrollRegularization.module#PayrollRegularizationModule' },
  { path: 'CompOffEss', loadChildren: './Leave/CompOffRequest/CompOffRequest.module#CompOffRequestModule' },
  { path: 'AttReports', loadChildren: './Leave/Reports/Reports.module#AttendanceReportsModule' },
  { path: 'HolidaysEss', loadChildren: './HolidaysMaster/HolidaysMaster.module#HolidaysMasterModule' },
  { path: 'ApplyLeaveEss', loadChildren: './Leave/ApplyLeave/ApplyLeave.module#ApplyLeaveModule' },
  { path: 'OnDutyRequestEss', loadChildren: './Leave/OnDutyRequest/OnDutyRequest.module#OnDutyRequestModule' },
  { path: 'PermissionEss', loadChildren: './Leave/PermissionRequest/PermissionRequest.module#PermissionRequestModule' },
  { path: 'ManpowerReport', loadChildren: './Leave/ManpowerReport/ManpowerReport.module#ManpowerReportModule' },
  { path: 'attendanceEss', loadChildren: './Leave/Attendance/Attendance.module#AttendanceModule' },
  // { path:'MarkAttendance' , loadChildren:'./Leave/MarkAttendance/MarkAttendance.module#MarkAttendanceModule'},
  { path: 'AttendanceDashBoards', loadChildren: './Leave/AttendanceDashboards/AttendanceDashboards.module#AttendanceDashboardsModule' },


  { path: 'ContractEmployee', loadChildren: './ContractEmployee/ContractEmployee.module#ContractEmployeeModule' },
  { path: 'ContractEmployeeList', loadChildren: './ContractEmployeeList/ContractEmployeeList.module#ContractEmployeeListModule' },
  { path: 'ContractEmployeeApproval', loadChildren: './ContractEmployeeApproval/ContractEmployeeApproval.module#ContractEmployeeApprovalModule' },
  { path: 'EditContractEmployee/:id', component: EditContractEmployeeComponent, canActivate: [AuthGuard] },
  { path: 'ViewContractEmployee/:id', component: ViewContractEmployeeComponent, canActivate: [AuthGuard] },
  { path: 'ApplyLeave', loadChildren: './Leave/ApplyLeave/ApplyLeave.module#ApplyLeaveModule' },
  { path: 'Holidays', loadChildren: './HolidaysMaster/HolidaysMaster.module#HolidaysMasterModule' },
  { path: 'WorkingCalendar', loadChildren: './WorkingCalendar/WorkingCalendar.module#WorkingCalendarModule' },
  { path: 'ShifMaster', loadChildren: './Leave/EmpShiftMaster/EmpShiftMaster.module#EmpShiftMasterModule' },
  { path: 'RulesMaster', loadChildren: './Leave/RulesMaster/RulesMaster.module#RulesMasterModule' },
  { path: 'shiftAssignment', loadChildren: './Leave/ShiftAssignment/ShiftAssignment.module#ShiftAssignmentModule' },
  { path: 'ShiftRegister', loadChildren: './Leave/ShiftRegister/ShiftRegister.module#ShiftRegisterModule' },
  { path: 'OnDutyRequest', loadChildren: './Leave/OnDutyRequest/OnDutyRequest.module#OnDutyRequestModule' },
  { path: 'MyApprovals', loadChildren: './Leave/MyApprovals/MyApprovals.module#MyApprovalsModule' },
  { path: 'Permission', loadChildren: './Leave/PermissionRequest/PermissionRequest.module#PermissionRequestModule' },
  { path: 'attendance', loadChildren: './Leave/Attendance/Attendance.module#AttendanceModule' },
  { path: 'OnDutyReport', loadChildren: './Leave/OnDutyReport/OnDutyReport.module#OnDutyReportModule' },
  { path: 'LeaveReport', loadChildren: './Leave/LeaveReport/LeaveReport.module#LeaveReportModule' },
  { path: 'PermissionReport', loadChildren: './Leave/PermissionReport/PermissionReport.module#PermissionReportModule' },
  { path: 'CompOffReport', loadChildren: './Leave/CompOffReport/CompOffReport.module#CompOffReportModule' },
  { path: 'OvertimeReport', loadChildren: './Leave/OvertimeReport/OvertimeReport.module#OvertimeReportModule' },
  { path: 'OverTimeReq', loadChildren: './Leave/OverTimeRequest/OverTimeRequest.module#OverTimeRequestModule' },
  { path: 'AttendanceProcessing', loadChildren: './Leave/AttendanceProcessing/AttendanceProcessing.module#AttendanceProcessingModule' },
  { path: 'ManualEntry', loadChildren: './Leave/ManualEntry/ManualEntry.module#ManualEntryModule' },
  { path: 'PayrollRegularization', loadChildren: './Leave/PayrollRegularization/PayrollRegularization.module#PayrollRegularizationModule' },
  { path: 'CompOff', loadChildren: './Leave/CompOffRequest/CompOffRequest.module#CompOffRequestModule' },
  { path: 'AttReports', loadChildren: './Leave/Reports/Reports.module#AttendanceReportsModule' },
  { path: 'HolidaysEss', loadChildren: './HolidaysMaster/HolidaysMaster.module#HolidaysMasterModule' },
  { path: 'ApplyLeaveEss', loadChildren: './Leave/ApplyLeave/ApplyLeave.module#ApplyLeaveModule' },
  { path: 'OnDutyRequestEss', loadChildren: './Leave/OnDutyRequest/OnDutyRequest.module#OnDutyRequestModule' },
  { path: 'PermissionEss', loadChildren: './Leave/PermissionRequest/PermissionRequest.module#PermissionRequestModule' },
  { path: 'LeaveCardEss', loadChildren: './Leave/LeaveCard/LeaveCard.module#LeaveCardModule' },
  { path: 'LeaveCard', loadChildren: './Leave/LeaveCard/LeaveCard.module#LeaveCardModule' },
  { path: 'attendanceEss', loadChildren: './Leave/Attendance/Attendance.module#AttendanceModule' },
  { path: 'OnDutyReportEss', loadChildren: './Leave/OnDutyReport/OnDutyReport.module#OnDutyReportModule' },
  { path: 'LeaveReportEss', loadChildren: './Leave/LeaveReport/LeaveReport.module#LeaveReportModule' },
  { path: 'PermissionReportEss', loadChildren: './Leave/PermissionReport/PermissionReport.module#PermissionReportModule' },
  { path: 'CompOffReportEss', loadChildren: './Leave/CompOffReport/CompOffReport.module#CompOffReportModule' },
  { path: 'OvertimeReportEss', loadChildren: './Leave/OvertimeReport/OvertimeReport.module#OvertimeReportModule' },
  { path: 'ChangeShift', loadChildren: './Leave/ChangeShift/ChangeShift.module#ChangeShiftModule' },
  { path: 'ChangeShiftEss', loadChildren: './Leave/ChangeShift/ChangeShift.module#ChangeShiftModule' },
  { path: 'ReachHR', loadChildren: './Leave/ReachHR/ReachHR.module#ReachHRModule' },
  { path: 'OverTimeReq', loadChildren: './Leave/OverTimeRequest/OverTimeRequest.module#OverTimeRequestModule' },
  { path: 'PayrollProcessing', loadChildren: './Leave/PayrollProcessing/PayrollProcessing.module#PayrollProcessingModule' },
  { path: 'RotationalShifts', loadChildren: './Leave/RotationalShift/RotationalShift.module#RotationalShiftModule' },
  { path: 'EsicsickleaveEss', loadChildren: './Leave/ESICSickLeave/EsicSickLeave.module#EsicSickLeaveModule' },
  { path: 'Esicsickleave', loadChildren: './Leave/ESICSickLeave/EsicSickLeave.module#EsicSickLeaveModule' },
  { path: 'TourPlanEss', loadChildren: './Leave/TourPlan/TourPlan.module#TourPlanModule' },
  { path: 'TourPlan', loadChildren: './Leave/TourPlan/TourPlan.module#TourPlanModule' },
  { path: 'LeaveStructure', loadChildren: './Leave/LeaveStructure/LeaveStructure.module#LeaveStructureModule' },
  { path: 'LeaveType', loadChildren: './Leave/LeaveTypeMaster/LeaveType.module#LeaveTypeModule' },
  { path: 'LeaveReasonMaster', loadChildren: './Leave/LeaveReasonMaster/LeaveReason.module#LeaveReasonModule' },
  { path: 'CompOtRules', loadChildren: './Leave/CompOtRules/CompOtRules.module#CompOtRulesModule' },
  { path: 'RegularizationRequest', loadChildren: './Leave/RegularizationRequest/RegularizationRequest.module#RegularizationRequestModule' },
  { path: 'ApplyLeaveEss', loadChildren: './Leave/ApplyLeave/ApplyLeave.module#ApplyLeaveModule' },
  { path: 'AbsentIntimation', loadChildren: './Leave/AbsentIntimation/AbsentIntimation.module#AbsentIntimationModule' },
  { path: 'EmployeeData', loadChildren: './Leave/EmployeeData/EmployeeData.module#EmployeeDataModule' },
  { path: 'EmployeeDataEss', loadChildren: './Leave/EmployeeData/EmployeeData.module#EmployeeDataModule' },
  { path: 'LOPReimbursementEss', loadChildren: './Leave/LOPReimbursement/LOPReimbursement.module#LOPReimbursementModule' },
  { path: 'LOPReimbursement', loadChildren: './Leave/LOPReimbursement/LOPReimbursement.module#LOPReimbursementModule' },
  { path: 'PayrollProcessing', loadChildren: './Leave/PayrollProcessing/PayrollProcessing.module#PayrollProcessingModule' },
  // { path: 'RotationalShifts' , loadChildren:'./Leave/RotationalShift/RotationalShift.module#RotationalShiftModule'},
  //{ path: 'EsicsickleaveEss', loadChildren: './Leave/ESICSickLeave/EsicSickLeave.module#EsicSickLeaveModule' },
  // { path: 'Esicsickleave', loadChildren: './Leave/ESICSickLeave/EsicSickLeave.module#EsicSickLeaveModule' },
  { path: 'TourPlanEss', loadChildren: './Leave/TourPlan/TourPlan.module#TourPlanModule' },
  { path: 'TourPlan', loadChildren: './Leave/TourPlan/TourPlan.module#TourPlanModule' },
  // { path: 'AllertBox', loadChildren: './Allertbox/Allertbox.module#AllertboxModule' },
  { path: 'PlantHead', loadChildren: './Leave/PlantHead/PlantHead.module#PlantHeadModule' },
  { path: 'PayRollRegularizationRequest', loadChildren: './Leave/PayRollRegularizationRequest/PayRollRegularizationRequest.module#PayRollRegularizationRequestModule' },


  //LA Reports
  { path: 'AddAttr', loadChildren: './Leave/Reports/AdditionandAttrition/AdditionandAttrition.module#AdditionandAttritionModule' },
  { path: 'AttendanceMustorSummary', loadChildren: './Leave/Reports/AttendanceMusterorSummary/AttendanceMusterorSummary.module#AttendanceMusterorSummaryModule' },
  { path: 'BiometricDeviceData', loadChildren: './Leave/Reports/BiometricDevicedata/BiometricDevicedata.module#BiometricDevicedataModule' },
  { path: 'PunchReport', loadChildren: './Leave/Reports/BiometricPunchReport/BiometricPunchReport.module#BiometricPunchReportModule' },
  { path: 'DaywiseAttendance', loadChildren: './Leave/Reports/Daywiseattendancestatus/Daywiseattendancestatus.module#DaywiseattendancestatusModule' },
  { path: 'Leavebalance', loadChildren: './Leave/Reports/Leavebalance/Leavebalance.module#LeavebalanceModule' },
  { path: 'Manpower', loadChildren: './Leave/Reports/Manpower/Manpower.module#ManpowerModule' },
  { path: 'ManualEntryRep', loadChildren: './Leave/Reports/ManualEntry/ManualEntry.module#ManualEntryModule' },
  { path: 'ShiftReport', loadChildren: './Leave/Reports/ShiftReport/ShiftReport.module#ShiftReportModule' },
  { path: 'OTReport', loadChildren: './Leave/Reports/OvertimeReport/OvertimeReport.module#OvertimeReportModule' },
  { path: 'LOPR', loadChildren: './Leave/Reports/LOPReimbursement/LOPReimbursement.module#LOPReimbursementModule' },
  { path: 'Allowance', loadChildren: './Leave/Reports/ShiftAllowance/ShiftAllowance.module#ShiftAllowanceModule' },
  { path: 'Intimation', loadChildren: './Leave/Reports/LeaveandODintimation/LeaveandODintimation.module#LeaveandODintimationModule' },
  { path: 'HolidayReport', loadChildren: './HolidaysReports/HolidaysReports.module#HolidaysReportsModule' },
  { path: 'WorkingCalendarReport', loadChildren: './WorkingCalendarReports/WorkingCalendarReports.module#WorkingCalendarReportsModule' },
   
  //ITAMS
    { path: 'AssetDashboard', loadChildren: './ITAMS/AssetDashboard/Assetdashboard.module#DashboardModule' },
    { path: 'AssetExplorer', loadChildren: './ITAMS/AssetExplorer/AssetExplorer.module#AssetExplorerModule' },
    { path: 'ChangeAssetDetails', loadChildren: './ITAMS/ChangeAssetDetails/ChangeAssetDetails.module#ChangeAssetDetailsModule' },
    { path: 'TransferAsset', loadChildren: './ITAMS/TransferAsset/TransferAsset.module#TransferAssetModule' },
    { path: 'StatusChange', loadChildren: './ITAMS/StatusChange/StatusChange.module#StatusChangeModule' },
    { path: 'DisposeAsset', loadChildren: './ITAMS/DisposeAsset/DisposeAsset.module#DisposeAssetModule' },
    { path: 'AssetReports', loadChildren: './ITAMS/AssetReports/AssetReports.module#AssetReportsModule' },
    { path: 'SparesReceipt', loadChildren: './ITAMS/SparesReceipt/SparesReceipt.module#SparesReceiptModule' },
    { path: 'SparesRequest', loadChildren: './ITAMS/SparesRequest/SparesRequest.module#SparesRequestModule' },
    { path: 'AssetLabelPrint', loadChildren: './ITAMS/AssetLabelPrint/AssetLabelPrint.module#AssetLabelPrintModule' },
    { path: 'ApproveAsset', loadChildren: './ITAMS/ApproveAsset/ApproveAsset.module#ApproveAssetModule' },

    //AMS
    { path: 'AssetSummary', loadChildren: './AMS/AssetSummary/AssetSummary.module#AssetSummaryModule' },
    { path: 'AssetExplorers', loadChildren: './AMS/AssetExplorer/AssetExplorer.module#AssetExplorerModule' },
    { path: 'AssetLabelPrint/:assetNo', loadChildren: './AMS/AssetLabelPrint/AssetLabelPrint.module#AssetLabelPrintModule' },
    { path: 'ChangeAssetDetails/:assetNo', loadChildren: './AMS/ChangeAssetDetails/ChangeAssetDetails.module#ChangeAssetDetailsModule' },
    //{ path: 'AssetLabelPrint/:asset_No', component: AssetLabelPrintComponent, canActivate: [AuthGuard] },
    //{path: 'AssetDetails', loadChildren:'./AMS/AssetDetails/AssetDetails.module#AssetDetailsModule' },
    { path: 'ApproveAssets', loadChildren: './AMS/ApproveAssets/ApproveAssets.module#ApproveAssetsModule' },

    { path: 'UserAcknowledgement', loadChildren: './AMS/UserAcknowledgement/UserAcknowledgement.module#UserAcknowledgementModule' },
    //{path: 'SpocDetails', loadChildren: './AMS/SpocDetails/SpocDetails.module#SpocDetailsModule' },
    //{path: 'UserAcknowledgement', loadChildren: './AMS/UserAcknowledgement/UserAcknowledgement.module#UserAcknowledgementModule' },
    { path: 'AMSReports', loadChildren: './AMS/AMSReports/AMSReports.module#AMSReportsModule' },

    // {path: 'HardSummary', loadChildren: './AMS/HardSummary/HardSummary.module#HardSummaryModule' },
    // {path: 'HardDetailed', loadChildren: './AMS/HardDetailed/HardDetailed.module#HardDetailedModule' },
    // {path: 'SoftSummary', loadChildren: './AMS/SoftSummary/SoftSummary.module#SoftSummaryModule' },
    // {path: 'SoftDetailed', loadChildren: './AMS/SoftDetailed/SoftDetailed.module#SoftDetailedModule' },




    //MLLDLS
    { path: 'DocCreate', loadChildren: './MLLDLS/DocCreate/DocCreate.module#DocCreateModule' },
    { path: 'DocBorrow', loadChildren: './MLLDLS/DocBorrow/DocBorrow.module#DocBorrowModule' },
    { path: 'DocDestruction', loadChildren: './MLLDLS/DocDestruction/DocDestruction.module#DocDestructionModule' },
    { path: 'DLSReports', loadChildren: './MLLDLS/DLSReports/DLSReports.module#DLSReportsModule' },
    { path: 'DLSTransReports', loadChildren: './MLLDLS/DLSTransReports/DLSTransReports.module#DLSTransReportsModule' },
    { path: 'BoxBarcode', loadChildren: './MLLDLS/BoxBarcode/BoxBarcode.module#BoxBarcodeModule' },
    { path: 'RoomRackBin', loadChildren: './MLLDLS/RoomRackBin/RoomRackBin.module#RoomRackBinModule' },
    { path: 'AssignApprover', loadChildren: './MLLDLS/AssignApprovers/AssignApprover.module#AssignApproversModule' },
    { path: 'TypeMaster', loadChildren: './MLLDLS/DocTypeMaster/DocTypeMaster.module#DocTypeMasterModule' },
    { path: 'DLSSubstitute', loadChildren: './MLLDLS/DLSSubstitute/DLSSubstitute.module#DLSSubstituteModule' },


    //HR 
    { path: 'HR/offer', loadChildren: () => OffersModule },
    { path: 'HR/appointment', loadChildren: () => AppointmentModule },
    { path: 'HR/checklist', loadChildren: () => ChecklistModule },
    { path: 'HR/ess', loadChildren: () => ESSModule },
    { path: 'HR/Employee', loadChildren: () => EmployeeModule },
    { path: 'HR/separation', loadChildren: () => SeparationModule },
    { path: 'HR/confirmation', loadChildren: () => ConfirmationModule },
    { path: 'HR/actions', loadChildren: () => ActionsModule },
    { path: 'HR/recall', loadChildren: () => RecallModule },
    { path: 'HR/termination', loadChildren: () => TerminationModule },
    { path: 'HR/retirement', loadChildren: () => RetirementModule },
    { path: 'HR/config', loadChildren: () => ConfigModule },
    { path: 'HR/fnf', loadChildren: () => FnFModule },
    { path: 'HR/admin', loadChildren: () => AdminModule },
    { path: 'HR/transfer', loadChildren: () => TransferModule },
    { path: 'AllowanceMapping', loadChildren: './HR/AllowanceMapping/AllowanceMapping.module#AllowanceMappingModule' },
    { path: 'PPCMaster', loadChildren: './HR/PPCMaster/PPCMaster.module#PPCMasterModule' },
    //Travel Desk
    { path: 'ExpenseUpdate', loadChildren: './TravelDesk/ExpenseUpdate/ExpenseUpdate.module#ExpenseUpdateModule' },
    { path: 'AccountSubmission', loadChildren: './TravelDesk/AccountSubmission/AccountSubmission.module#AccountSubmissionModule' },
    { path: 'AccountReports', loadChildren: './TravelDesk/Reports/AccountReports.module#AccountReportsModule' },
    { path: 'TravelDashboard', loadChildren: './TravelDesk/TravelDashboard/TravelDashboard.module#TravelDashboardModule' },
    { path: 'PaymentDetails', loadChildren: './TravelDesk/PaymentDetails/PaymentDetails.module#PaymentDetailsModule' },
    { path: 'TdVendorMaster', loadChildren: './TravelDesk/TdVendorMaster/TdVendorMaster.module#TdVendorMasterModule' },
    { path: 'TdTypeOfEvent', loadChildren: './TravelDesk/TdTypeOfEventMaster/TdTypeOfEventMaster.module#TdTypeOfEventMasterModule' },
    { path: 'FinancialReport', loadChildren: './TravelDesk/FinancialReport/FinancialReport.module#FinancialReportModule' },

    //WMTS
    { path: 'MIGO', loadChildren: './WMTS/MIGOPosting/MIGOPosting.module#MIGOPostingModule' },
    { path: 'DC', loadChildren: './WMTS/DCPosting/DCPosting.module#DCPostingModule' },
    { path: 'Reports', loadChildren: './WMTS/Reports/Reports.module#ReportsModule' },
    { path: 'LooseTransfer', loadChildren: './WMTS/LooseDCLabelSummary/LooseDCLabelSummary.module#LooseDCLabelSummaryModule' },
    { path: 'DCCancellation', loadChildren: './WMTS/DCCancellation/DCCancellation.module#DCCancellationModule' },
    { path: 'SecurityVerificationReport', loadChildren: './WMTS/SecurityVerificationReport/SecurityVerificationReport.module#SecurityVerificationReportModule' },
    { path: 'PickingSummary', loadChildren: './WMTS/PickingSummary/PickingSummary.module#PickingSummaryModule' },
    { path: 'GatePass', loadChildren: './WMTS/GatePass/GatePass.module#GatePassModule' },
    { path: 'DCVerificationReport', loadChildren: './WMTS/DCVerificationReport/DCVerificationReport.module#DCVerificationReportModule' },
    { path: 'SamplingReport', loadChildren: './WMTS/SamplingReport/SamplingReport.module#SamplingReportModule' },
    { path: 'MonthEndDCApproval', loadChildren: './WMTS/MonthEndDCApproval/MonthEndDCApproval.module#MonthEndDCApprovalModule' },
    // { path: 'StockReport', loadChildren: './WMTS/StockReport/StockReport.module#StockReportModule' },


    //Phase II

     //Phase -II changes
   { path: 'vmsapproval', loadChildren: './VMSApproval/VMSApproval.module#VMSApprovalModule'},
   { path: 'GeApproval', loadChildren: './geoutothermatApproval/geoutothermatApproval.module#geoutothermatApprovalModule'},
   { path: 'amc-entry/:id', loadChildren: './UpdateAMCDetails/UpdateAMCDetails.module#UpdateAMCDetailsModule' },
   { path: 'amc-view/:id', loadChildren: './ViewAMCDetails/ViewAMCDetails.module#ViewAMCDetailsModule' },
   { path: 'GEDashboard', loadChildren: './GEDashboard/GEDashboard.module#GEDashboardModule' },
   { path: 'UserReport', loadChildren: './UID/UserReport/UserReport.module#UserReportModule'},
   { path: 'BulkUpload', loadChildren: './UID/UserIdsBulkUpload/UserIdsBulkUpload.module#UserIdsBulkUploadModule'},
   { path: 'UIDSummaryReport', loadChildren: './UID/UserIDSummaryReport/UserIDSummaryReport.module#UserIDSummaryReportModule'},
   { path: 'UIDDetailedReport', loadChildren: './UID/UserIDDetailedReport/UserIDDetailedReport.module#UserIDDetailedReportModule'},
   { path: 'DetailedReport/:id/:id2/:ReqType',loadChildren: './UID/UserIDDetailedReport/UserIDDetailedReport.module#UserIDDetailedReportModule'},
   { path: 'DetailedReport/:id/:id2/:id3/:ReqType',loadChildren: './UID/UserIDDetailedReport/UserIDDetailedReport.module#UserIDDetailedReportModule'},

   //SAP Masters Changes
   { path: 'CustomerMasterChanges', loadChildren:'./eMicro/CustomerMasterChanges/CustomerMasterChanges.module#CustomerMasterChangesModule'},
   { path: 'VendorMasterChanges', loadChildren:'./eMicro/VendorMasterChanges/VendorMasterChanges.module#VendorMasterChangesModule'},
   { path: 'ServiceMasterChanges', loadChildren:'./eMicro/ServiceMasterChanges/ServiceMasterChanges.module#ServiceMasterChangesModule'},
   { path: 'FinanceApproval' ,loadChildren: './eMicro/FinanceApproval/FinanceApproval.module#FinanceApprovalModule' },

    //IT
    { path: 'ITTicket', loadChildren: './IT/ITTicket/itticket.module#itticketModule' },



    { path: 'formmaster', loadChildren: './masters/form-master/form-master.module#FormMasterModule' },
    { path: 'unauthorized', loadChildren: './unauthorized/unauthorized.module#UnauthorizedModule' },
    // { path: 'department', loadChildren: './masters/department/department.module#DepartmentModule' },
    // { path: 'state', loadChildren: './masters/state/state.module#StateModule' },
    { path: 'template', loadChildren: './masters/template/template.module#TemplateModule' },
    { path: 'templatelist', loadChildren: './masters/templatelist/templatelist.module#TemplatelistModule' },
    //{ path: '**', redirectTo: 'dashboard' }
    { path: '**', redirectTo: 'initpage' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, { useHash: true })
        //RouterModule.forRoot(appRoutes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {

}
