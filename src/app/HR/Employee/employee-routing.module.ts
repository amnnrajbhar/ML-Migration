import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { ListComponent } from './list/list.component';
import { ProfileComponent } from './profile/profile.component';
import { DocumentsComponent } from '../../HR/Employee/documents/documents.component';
import { BulkEmployeeListComponent } from  '../../HR/Employee/BulkEmployee/bulk-employee-list/bulk-employee-list.component';
import { PlantPayGroupBulkUpdateComponent } from  '../../HR/Employee/plant-pay-group-bulk-update/plant-pay-group-bulk-update.component';
import { ReportListComponent } from '../../HR/Employee/report-list/report-list.component';
import { ReportCtcSummaryComponent } from '../../HR/Employee/report-ctc-summary/report-ctc-summary.component';
import { DashboardComponent } from '../../HR/Employee/dashboard/dashboard.component';
import { EditComponent } from '../../HR/Employee/edit/edit.component';
import { ViewComponent } from '../../HR/Employee/view/view.component';
import { UpdateListComponent } from '../../HR/Employee/update-list/update-list.component';
import { UpdateViewComponent } from '../../HR/Employee/update-view/update-view.component';

const routes: Routes = [
    { path: 'list', component: ListComponent, canActivate: [AuthGuard] },
    { path: 'update-list', component: UpdateListComponent, canActivate: [AuthGuard] },
    { path: 'update-view/:id', component: UpdateViewComponent, canActivate: [AuthGuard] },
    { path: 'edit', component: EditComponent, canActivate: [AuthGuard] },
    { path: 'edit/:id', component: EditComponent, canActivate: [AuthGuard] },
    { path: 'view/:id', component: ViewComponent, canActivate: [AuthGuard] },
    { path: 'profile/:id', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'documents', component: DocumentsComponent, canActivate: [AuthGuard] },
    { path: 'bulk-update', component: BulkEmployeeListComponent, canActivate: [AuthGuard] },
    { path: 'bulk-update-plant-paygroup', component: PlantPayGroupBulkUpdateComponent, canActivate: [AuthGuard] },
    { path: 'report-list', component: ReportListComponent, canActivate: [AuthGuard] },
    { path: 'report-ctc-summary', component: ReportCtcSummaryComponent, canActivate: [AuthGuard] },
    { path: 'list/:id', component: ListComponent, canActivate: [AuthGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
