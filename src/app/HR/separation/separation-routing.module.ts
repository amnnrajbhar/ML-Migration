import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { ResignationComponent } from './resignation/resignation.component';
import { ResignationListComponent } from './resignation-list/resignation-list.component';
import { SelectEmployeeComponent } from './select-employee/select-employee.component';
import { ViewResignationComponent } from './view-resignation/view-resignation.component';
import { EditResignationComponent } from './edit-resignation/edit-resignation.component';
import { PendingResignationComponent } from './pending-resignation/pending-resignation.component';
import { EditResignationApproverComponent } from './edit-resignation-approver/edit-resignation-approver.component';
import { ResignationChecklistComponent } from './resignation-checklist/resignation-checklist.component';
import { ClearanceChecklistComponent } from './clearance-checklist/clearance-checklist.component';
import { PrintExitComponent } from './print-exit/print-exit.component';
import { InitiateExitComponent } from './initiate-exit/initiate-exit.component';
import { ExitInterviewTemplatesComponent } from '../../HR/separation/exit-interview-templates/exit-interview-templates.component';
import { CompleteExitComponent } from '../../HR/separation/complete-exit/complete-exit.component';
import { PrintExitInterviewComponent } from '../../HR/separation/print-exit-interview/print-exit-interview.component';
import { ExitInterviewListComponent } from '../../HR/separation/exit-interview-list/exit-interview-list.component';
import { ExitInterviewComponent } from '../../HR/separation/exit-interview/exit-interview.component';
import { ExitInterviewLinkComponent } from '../../HR/separation/exit-interview-link/exit-interview-link.component';
import { ResignationListReportComponent } from '../../HR/separation/resignation-list-report/resignation-list-report.component';
import { AttirationReportComponent } from '../../HR/separation/attiration-report/attiration-report.component';
import { PaymentListComponent } from '../../HR/separation/payment-list/payment-list.component';
import { AddPaymentComponent } from '../../HR/separation/add-payment/add-payment.component';
import { DashboardComponent } from '../../HR/separation/dashboard/dashboard.component';
import { ResignationPrintComponent } from '../../HR/separation/resignation-print/resignation-print.component';
import { ChecklistComponent } from '../../HR/separation/checklist/checklist.component';

const routes: Routes = [
  { path: 'resignation/:id', component: ResignationComponent, canActivate: [AuthGuard] },
  { path: 'resignation-list', component: ResignationListComponent, canActivate: [AuthGuard] },
  { path: 'select-employee', component: SelectEmployeeComponent, canActivate: [AuthGuard] },
  { path: 'view-resignation/:id', component: ViewResignationComponent, canActivate: [AuthGuard] },
  { path: 'edit-resignation/:id', component: EditResignationComponent, canActivate: [AuthGuard] },
  { path: 'pending-resignation', component: PendingResignationComponent, canActivate: [AuthGuard] },
  { path: 'edit-resignation-approver/:id1/:id2', component: EditResignationApproverComponent, canActivate: [AuthGuard] },
  { path: 'clearance-checklist', component: ClearanceChecklistComponent, canActivate: [AuthGuard] },
  { path: 'print-exit/:id', component: PrintExitComponent, canActivate: [AuthGuard] },
  { path: 'initiate-exit/:id', component: InitiateExitComponent, canActivate: [AuthGuard] },
  { path: 'complete-exit/:id', component: CompleteExitComponent, canActivate: [AuthGuard] },
  { path: 'exit-interview-templates', component: ExitInterviewTemplatesComponent, canActivate: [AuthGuard] },
  { path: 'print-exit-interview/:id', component: PrintExitInterviewComponent, canActivate: [AuthGuard] },
  { path: 'exit-interview-list', component: ExitInterviewListComponent, canActivate: [AuthGuard] },
  { path: 'view-resignation/:id/:id2', component: ViewResignationComponent, canActivate: [AuthGuard] },
  { path: 'exit-interview-link/:id/:id2', component: ExitInterviewLinkComponent },
  { path: 'resignation-list-report', component: ResignationListReportComponent, canActivate: [AuthGuard] },
  { path: 'attiration-report', component: AttirationReportComponent, canActivate: [AuthGuard] },
  { path: 'payment-list', component: PaymentListComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'add-payment/:id/:id1', component: AddPaymentComponent, canActivate: [AuthGuard] },
  { path: 'resignation-print/:id', component: ResignationPrintComponent, canActivate: [AuthGuard] },
  { path: 'checklist', component: ChecklistComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeparationRoutingModule { }
