import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { SelectEmployeeComponent } from '../../HR/recall/select-employee/select-employee.component';
import { RecallComponent } from '../../HR/recall/recall/recall.component';
import { RecallListComponent } from '../../HR/recall/recall-list/recall-list.component';
import { PendingRecallComponent } from '../../HR/recall/pending-recall/pending-recall.component';
import { ViewRecallComponent } from '../../HR/recall/view-recall/view-recall.component';
import { PendingRecallApprovalComponent } from './pending-recall-approval/pending-recall-approval.component';
import { EditRecallComponent } from './edit-recall/edit-recall.component';
import { PrintRecallComponent } from './print-recall/print-recall.component';
import { RecallListReportComponent } from '../../HR/recall/recall-list-report/recall-list-report.component';

const routes: Routes = [
    { path: 'select-employee', component: SelectEmployeeComponent, canActivate: [AuthGuard] },
    { path: 'recall/:id', component: RecallComponent, canActivate: [AuthGuard] }, 
    { path: 'recall-list', component: RecallListComponent, canActivate: [AuthGuard] },
    { path: 'pending-recall', component: PendingRecallComponent, canActivate: [AuthGuard] },
    { path: 'view-recall/:id/:id2', component: ViewRecallComponent, canActivate: [AuthGuard] },
    { path: 'pending-recall-approval/:id/:id2/:id3', component: PendingRecallApprovalComponent, canActivate: [AuthGuard] },
    { path: 'edit-recall/:id/:id2', component: EditRecallComponent, canActivate: [AuthGuard] },
    { path: 'print-recall/:id', component: PrintRecallComponent, canActivate: [AuthGuard] },    
    { path: 'recall-list-report', component: RecallListReportComponent, canActivate: [AuthGuard] },

  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecallRoutingModule { }
