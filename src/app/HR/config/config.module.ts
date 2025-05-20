import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigRoutingModule } from './config-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

import { AngularEditorModule} from '@kolkov/angular-editor';
import { ESSModule} from '../ESS/ess.module';
import { HRSharedModule} from '../shared/hr-shared.module';
import { OfferEmailNotificationComponent } from '../../HR/config/offer-email-notification/offer-email-notification.component';
import { AnnouncementsComponent } from '../../HR/config/announcements/announcements.component';
import { MoreLinksComponent } from '../../HR/config/more-links/more-links.component';
import { OfferEmailListComponent } from '../../HR/config/offer-email-list/offer-email-list.component';
import { EditEmailNotificationComponent } from '../../HR/config/edit-email-notification/edit-email-notification.component';
import { ApproverListComponent } from '../../HR/config/approvers/approver-list/approver-list.component';
import { ApproverCreateComponent } from '../../HR/config/approvers/approver-create/approver-create.component';
import { ApproverEditComponent } from '../../HR/config/approvers/approver-edit/approver-edit.component';
import { ConfirmationAutoInitiationComponent } from '../../HR/config/confirmation-auto-initiation/confirmation-auto-initiation.component';
import { EmployeeRejoinConfigComponent } from '../../HR/config/employee-rejoin-config/employee-rejoin-config.component';
import { SmsTemplatesComponent } from '../../HR/config/sms-templates/sms-templates.component';
import { AllowanceMasterComponent } from '../../HR/config/allowance-master/allowance-master.component';
import { SalarystructureMasterComponent } from '../../HR/config/salarystructure-master/salarystructure-master.component';
import { WorkflowapproverMasterComponent } from '../../HR/config/workflowapprover-master/workflowapprover-master.component';
import { CtcformulaComponent } from '../../HR/config/ctcformula/ctcformula.component';
import { ChecklistComponent } from '../../HR/config/checklist/checklist.component';
import { SignatoryComponent } from '../../HR/config/signatory/signatory.component';
import { AllowancemappingComponent } from '../../HR/config/allowancemapping/allowancemapping.component';
import { EmployeeRejoinExecptionComponent } from '../../HR/config/employee-rejoin-execption/employee-rejoin-execption.component';
import { NoEmailToCandidateConfigComponent } from '../../HR/config/no-email-to-candidate-config/no-email-to-candidate-config.component';

import { CtcslabComponent } from '../../HR/config/ctcslab/ctcslab.component';


import { EmailTemplatesComponent } from '../../HR/config/email-templates/email-templates.component';
import { LetterTemplatesComponent } from '../../HR/config/letter-templates/letter-templates.component';

import { LetterMappingConfigComponent } from '../../HR/config/letter-mapping-config/letter-mapping-config.component';

@NgModule({
  imports: [
    CommonModule,    
    FormsModule,
    SharedmoduleModule,
    AngularEditorModule,
    ConfigRoutingModule,
    ESSModule,
    HRSharedModule
  ],
  declarations: [
  OfferEmailNotificationComponent,
  OfferEmailListComponent,
  EditEmailNotificationComponent,
  ApproverListComponent,
  ApproverCreateComponent,
  ApproverEditComponent,
  AnnouncementsComponent,
  MoreLinksComponent,
  ConfirmationAutoInitiationComponent,
  EmployeeRejoinConfigComponent,
  SmsTemplatesComponent,
  AllowanceMasterComponent,
  SalarystructureMasterComponent,
  WorkflowapproverMasterComponent,
  CtcformulaComponent,
  NoEmailToCandidateConfigComponent,
  ChecklistComponent,
  SignatoryComponent,
  AllowancemappingComponent,
  EmployeeRejoinExecptionComponent,
  
  CtcslabComponent,  
  EmailTemplatesComponent,
  LetterTemplatesComponent,
  LetterMappingConfigComponent
  ],
  exports: [    
  ]
})
export class ConfigModule { }
