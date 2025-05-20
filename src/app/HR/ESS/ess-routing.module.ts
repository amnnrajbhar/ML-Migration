import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { PreJoiningComponent } from './checklist/pre-joining/pre-joining.component';
import { SeparationComponent } from './checklist/separation/separation.component';
import { ViewComponent } from './profile/view/view.component';
import { JoiningUpdateComponent } from '../../HR/ESS/checklist/joining-update/joining-update.component';
import { SeparationUpdateComponent } from './checklist/separation-update/separation-update.component';
import { TerminationUpdateComponent } from '../../HR/ESS/checklist/termination-update/termination-update.component';
import { ConfirmlisthodComponent } from  '../../HR/ESS/confirmlisthod/confirmlisthod.component';
import { ResignationComponent } from '../../HR/ESS/resignation/resignation.component';
import { EmailPreferenceListComponent } from '../../HR/ESS/email-preference-list/email-preference-list.component'
import { PendingEmployeeProfileComponent } from '../../HR/ESS/pending-employee-profile/pending-employee-profile.component';
import { EmployeeTransferComponent } from '../../HR/ESS/employee-transfer/employee-transfer.component';
import { ConfirmTransferJoiningComponent } from '../../HR/ESS/confirm-transfer-joining/confirm-transfer-joining.component';
import { ApprovalDelegationComponent } from '../../HR/ESS/approval-delegation/approval-delegation.component';
import { EmployeeProfileUpdateListComponent } from '../../HR/ESS/employee-profile-update-list/employee-profile-update-list.component';
import { PendingEmployeeProfileListComponent } from '../../HR/ESS/pending-employee-profile-list/pending-employee-profile-list.component';
import { MyApprovalsComponent } from '../../HR/ESS/my-approvals/my-approvals.component';
import { RetirementListComponent } from  '../../HR/ESS/retirement-list/retirement-list.component';
import { SelfRetirementComponent } from './self-retirement/self-retirement.component';

const routes: Routes = [
    { path: 'checklist/pre-joining', component: PreJoiningComponent, canActivate: [AuthGuard] },
    { path: 'checklist/separation', component: SeparationComponent, canActivate: [AuthGuard] },
    { path: 'profile/view', component: ViewComponent, canActivate: [AuthGuard] },
    { path: 'resignation', component: ResignationComponent, canActivate: [AuthGuard] },
    { path: 'checklist/joining-update/:id', component: JoiningUpdateComponent, canActivate: [AuthGuard] },
    { path: 'checklist/separation-update/:id', component: SeparationUpdateComponent, canActivate: [AuthGuard] },
    { path: 'checklist/termination-update/:id', component: TerminationUpdateComponent, canActivate: [AuthGuard] },
    { path: 'confirmation/list', component: ConfirmlisthodComponent, canActivate: [AuthGuard] },
    { path: 'email-preference-list', component: EmailPreferenceListComponent, canActivate: [AuthGuard] },
    { path: 'pending-employee-profile/:id/:id1/:id2', component: PendingEmployeeProfileComponent, canActivate: [AuthGuard] },    
    { path: 'pending-employee-profile-list', component: PendingEmployeeProfileListComponent, canActivate: [AuthGuard] },     
    { path: 'employee-transfer', component: EmployeeTransferComponent, canActivate: [AuthGuard] },
    { path: 'confirm-transfer-joining', component: ConfirmTransferJoiningComponent, canActivate: [AuthGuard] },   
    { path: 'approval-delegation', component: ApprovalDelegationComponent, canActivate: [AuthGuard] },
    { path: 'my-approvals', component: MyApprovalsComponent, canActivate: [AuthGuard] },
    { path: 'employee-profile-update-list', component: EmployeeProfileUpdateListComponent, canActivate: [AuthGuard] },
    { path: 'self-retirement', component: SelfRetirementComponent, canActivate: [AuthGuard] },
    { path: 'retirement/retirement-list', component: RetirementListComponent, canActivate: [AuthGuard] },
  
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ESSRoutingModule { }
