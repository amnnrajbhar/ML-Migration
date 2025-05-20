import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { ListComponent } from './list/list.component';
import {ConfirmedemployeelistListComponent } from './confirmemployeelist/confirmemployeelist.component';
import { ConfirmationpendingtaskComponent } from '../../HR/confirmation/confirmationpendingtask/confirmationpendingtask.component';
// import { ProfileComponent } from './profile/profile.component';
// import { DocumentsComponent } from '../../HR/Employee/documents/documents.component';
import { ConfirmationDetailComponent } from '../../HR/confirmation/confirmation-detail/confirmation-detail.component';
import { ConfirmationPrintComponent } from '../../HR/confirmation/confirmation-print/confirmation-print.component';
import { ViewComponent } from '../../HR/confirmation/view/view.component';
import { ApproveComponent } from '../../HR/confirmation/approve/approve.component';
//import { EditConfirmationComponent } from '../../HR/confirmation/edit-confirmation/edit-confirmation.component';
import { DetailComponent } from '../../HR/confirmation/detail/detail.component';
import { ReportListComponent } from '../../HR/confirmation/report-list/report-list.component';
import { ReportSummaryComponent } from '../../HR/confirmation/report-summary/report-summary.component';
import { BulkConfirmationComponent } from '../../HR/confirmation/bulk-confirmation/bulk-confirmation.component';
const routes: Routes = [
     { path: 'list', component: ListComponent, canActivate: [AuthGuard] },
     { path: 'employee-list', component: ConfirmedemployeelistListComponent, canActivate: [AuthGuard] },
     { path: 'pending-tasks', component: ConfirmationpendingtaskComponent, canActivate: [AuthGuard] },
     { path: 'confirmation-detail/:id/:id2', component: ConfirmationDetailComponent, canActivate: [AuthGuard] },
     { path: 'confirmation-print/:id', component: ConfirmationPrintComponent, canActivate: [AuthGuard] },
     { path: 'view/:id', component: ViewComponent, canActivate: [AuthGuard] },
     { path: 'approve/:id/:id2', component: ApproveComponent, canActivate: [AuthGuard] },
    //  { path: 'edit-confirmation/:id', component: EditConfirmationComponent, canActivate: [AuthGuard] },
     { path: 'detail/:id/:id2/:id3', component: DetailComponent, canActivate: [AuthGuard] },
     { path: 'report-list', component: ReportListComponent, canActivate: [AuthGuard] },
     { path: 'report-summary', component: ReportSummaryComponent, canActivate: [AuthGuard] },
     { path: 'bulk-confirmation', component: BulkConfirmationComponent, canActivate: [AuthGuard] },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfirmationRoutingModule { }
