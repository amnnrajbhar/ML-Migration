import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { ESSRoutingModule } from './ess-routing.module';
import { PreJoiningComponent } from './checklist/pre-joining/pre-joining.component';
import { SeparationComponent } from './checklist/separation/separation.component';
import { OfficialComponent } from './profile/official/official.component';
import { SalaryComponent } from './profile/salary/salary.component';
import { DocumentsComponent } from './profile/documents/documents.component';
import { ViewComponent } from './profile/view/view.component';
import { JoiningUpdateComponent } from './checklist/joining-update/joining-update.component';
import { SeparationUpdateComponent } from './checklist/separation-update/separation-update.component';
import { ResignationComponent } from './resignation/resignation.component';
import { HRSharedModule } from '../shared/hr-shared.module';
import { SeparationModule } from '../separation/separation.module';
import { ConfirmlisthodComponent } from '../../HR/ESS/confirmlisthod/confirmlisthod.component';
import { TerminationUpdateComponent } from '../../HR/ESS/checklist/termination-update/termination-update.component';
import { EmailPreferenceListComponent } from '../../HR/ESS/email-preference-list/email-preference-list.component';
import { AddressComponent } from '../../HR/ESS/profile/address/address.component';
import { EducationComponent } from '../../HR/ESS/profile/education/education.component';
import { ExperienceComponent } from '../../HR/ESS/profile/experience/experience.component';
import { FamilyComponent } from '../../HR/ESS/profile/family/family.component';
import { LanguagesComponent } from '../../HR/ESS/profile/languages/languages.component';
import { EmployeeTransferComponent } from '../../HR/ESS/employee-transfer/employee-transfer.component';
//import { EmployeeModule } from '../Employee/employee.module';
import { PendingEmployeeProfileComponent } from '../../HR/ESS/pending-employee-profile/pending-employee-profile.component';
import { ConfirmTransferJoiningComponent } from '../../HR/ESS/confirm-transfer-joining/confirm-transfer-joining.component';
import { ApprovalDelegationComponent } from '../../HR/ESS/approval-delegation/approval-delegation.component';
import { EmployeeProfileUpdateListComponent } from '../../HR/ESS/employee-profile-update-list/employee-profile-update-list.component';
import { PendingEmployeeProfileListComponent } from '../../HR/ESS/pending-employee-profile-list/pending-employee-profile-list.component';
import { MyApprovalsComponent } from '../../HR/ESS/my-approvals/my-approvals.component';
import { UpdateHistoryComponent } from '../../HR/ESS/profile/update-history/update-history.component';
import { RetirementListComponent } from '../../HR/ESS/retirement-list/retirement-list.component';
import { SelfRetirementComponent } from './self-retirement/self-retirement.component';
import { AssetsComponent } from '../../HR/ESS/profile/assets/assets.component';
import { RetirementModule } from '../retirement/retirement.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ESSRoutingModule,
    HRSharedModule,
    SeparationModule,
    RetirementModule
    //EmployeeModule
  ],
  declarations: [    
    PreJoiningComponent,
    SeparationComponent,
    OfficialComponent,
    SalaryComponent,
    DocumentsComponent,
    ViewComponent,
    JoiningUpdateComponent,
    SeparationUpdateComponent,
    ResignationComponent,
    ConfirmlisthodComponent,
    TerminationUpdateComponent,
    EmailPreferenceListComponent,
    AddressComponent,
    EducationComponent,
    ExperienceComponent,
    FamilyComponent,
    LanguagesComponent,
    EmployeeTransferComponent,
    PendingEmployeeProfileComponent,
    ConfirmTransferJoiningComponent,
    ApprovalDelegationComponent,
    EmployeeProfileUpdateListComponent,
    PendingEmployeeProfileListComponent,
    MyApprovalsComponent,
    SelfRetirementComponent,
    UpdateHistoryComponent,
    RetirementListComponent,
    AssetsComponent,
  
  ],
  exports: [
    OfficialComponent,
    SalaryComponent,
    DocumentsComponent,
    AddressComponent,
    EducationComponent,
    ExperienceComponent,
    FamilyComponent,
    LanguagesComponent,
    AssetsComponent,
    UpdateHistoryComponent,
  ]
})
export class ESSModule { }
