import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { OfferEmailNotificationComponent } from '../../HR/config/offer-email-notification/offer-email-notification.component';
import { OfferEmailListComponent } from '../../HR/config/offer-email-list/offer-email-list.component';
import { EditEmailNotificationComponent } from '../../HR/config/edit-email-notification/edit-email-notification.component';
import { ApproverListComponent } from '../../HR/config/approvers/approver-list/approver-list.component';
import { ApproverCreateComponent } from '../../HR/config/approvers/approver-create/approver-create.component';
import { ApproverEditComponent } from '../../HR/config/approvers/approver-edit/approver-edit.component';
import { AnnouncementsComponent } from '../../HR/config/announcements/announcements.component';
import { MoreLinksComponent } from '../../HR/config/more-links/more-links.component';
import { ConfirmationAutoInitiationComponent } from '../../HR/config/confirmation-auto-initiation/confirmation-auto-initiation.component';
import { EmployeeRejoinConfigComponent } from '../../HR/config/employee-rejoin-config/employee-rejoin-config.component';
import { EmployeeRejoinExecptionComponent } from './employee-rejoin-execption/employee-rejoin-execption.component';
import { SmsTemplatesComponent } from '../../HR/config/sms-templates/sms-templates.component';
import { AllowanceMasterComponent } from '../../HR/config/allowance-master/allowance-master.component';
import { SalarystructureMasterComponent } from '../../HR/config/salarystructure-master/salarystructure-master.component';
import { WorkflowapproverMasterComponent } from '../../HR/config/workflowapprover-master/workflowapprover-master.component';
import { NoEmailToCandidateConfigComponent } from '../../HR/config/no-email-to-candidate-config/no-email-to-candidate-config.component';

import { CtcformulaComponent } from '../../HR/config/ctcformula/ctcformula.component';
import { ChecklistComponent } from '../../HR/config/checklist/checklist.component';
import { SignatoryComponent } from '../../HR/config/signatory/signatory.component';
import { AllowancemappingComponent } from '../../HR/config/allowancemapping/allowancemapping.component';
import { CtcslabComponent } from '../../HR/config/ctcslab/ctcslab.component';
import { EmailTemplatesComponent } from '../../HR/config/email-templates/email-templates.component';
import { LetterTemplatesComponent } from '../../HR/config/letter-templates/letter-templates.component';
import { LetterMappingConfigComponent } from '../../HR/config/letter-mapping-config/letter-mapping-config.component';

const routes: Routes = [
  { path: 'offer-email-notification', component: OfferEmailNotificationComponent, canActivate: [AuthGuard] }, 
  { path: 'offer-email-notification/:id', component: OfferEmailNotificationComponent, canActivate: [AuthGuard] },
  { path: 'edit-email-notification/:id', component: EditEmailNotificationComponent, canActivate: [AuthGuard] },    
  { path: 'offer-email-list', component: OfferEmailListComponent, canActivate: [AuthGuard] },   
  { path: 'announcements', component: AnnouncementsComponent, canActivate: [AuthGuard] },   
    { path: 'more-links', component: MoreLinksComponent, canActivate: [AuthGuard] },
    { path: 'approver-list', component: ApproverListComponent, canActivate: [AuthGuard] },
    { path: 'approver-create', component: ApproverCreateComponent, canActivate: [AuthGuard] },
    { path: 'approvers/approver-edit/:id', component: ApproverEditComponent, canActivate: [AuthGuard] },
    { path: 'confirmation-auto-initiation', component: ConfirmationAutoInitiationComponent, canActivate: [AuthGuard] },
    { path: 'employee-rejoin-config', component: EmployeeRejoinConfigComponent, canActivate: [AuthGuard] },
    { path: 'employee-rejoin-execption', component: EmployeeRejoinExecptionComponent, canActivate: [AuthGuard] },
    { path: 'sms-templates', component: SmsTemplatesComponent, canActivate: [AuthGuard] },
    { path: 'allowance-master', component: AllowanceMasterComponent, canActivate: [AuthGuard] },
    { path: 'salarystructure-master', component: SalarystructureMasterComponent, canActivate: [AuthGuard] },
    { path: 'workflowapprover-master', component: WorkflowapproverMasterComponent, canActivate: [AuthGuard] },
    { path: 'ctcformula', component: CtcformulaComponent, canActivate: [AuthGuard] },
    { path: 'checklist', component: ChecklistComponent, canActivate: [AuthGuard] },
    { path: 'signatory', component: SignatoryComponent, canActivate: [AuthGuard] },
    { path: 'allowancemapping', component: AllowancemappingComponent, canActivate: [AuthGuard] },
    { path: 'no-email-to-candidate-config', component: NoEmailToCandidateConfigComponent, canActivate: [AuthGuard] },

    { path: 'ctcslab', component: CtcslabComponent, canActivate: [AuthGuard] },
   
    { path: 'email-templates',component:EmailTemplatesComponent ,canActivate:[AuthGuard]},
    { path: 'letter-templates',component:LetterTemplatesComponent ,canActivate:[AuthGuard]},
    { path: 'letter-mapping-config', component: LetterMappingConfigComponent, canActivate: [AuthGuard] },
    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule { }
