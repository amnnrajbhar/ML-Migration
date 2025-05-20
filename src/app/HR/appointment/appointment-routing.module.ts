import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { EntryComponent } from './entry/entry.component';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { HrEntryComponent } from './hr-entry/hr-entry.component';
import { AddComponent } from './add/add.component';
import { ViewComponent } from './view/view.component';
import { PreviewComponent } from './preview/preview.component';
import { ViewFullComponent } from './view-full/view-full.component';
import { PrintComponent } from './print/print.component';
import { VerifyComponent } from './verify/verify.component';
import { JoiningListComponent } from './joining-list/joining-list.component';
import { ConfirmJoiningComponent } from './confirm-joining/confirm-joining.component';
import { EditFullComponent } from '../../HR/appointment/edit-full/edit-full.component';
import { AcceptComponent } from '../../HR/appointment/accept/accept.component';
import { JoiningReportComponent } from '../../HR/appointment/joining-report/joining-report.component';
import { ActivityReportComponent } from '../../HR/appointment/activity-report/activity-report.component';

const routes: Routes = [
    { path: 'entry/:id/:id2', component: EntryComponent},
    { path: 'list', component: ListComponent, canActivate: [AuthGuard] },
    { path: 'edit/:id', component: EditComponent, canActivate: [AuthGuard] },
    { path: 'view/:id', component: ViewComponent, canActivate: [AuthGuard] },
    { path: 'preview/:id', component: PreviewComponent, canActivate: [AuthGuard] },
    { path: 'print/:id', component: PrintComponent, canActivate: [AuthGuard] },
    { path: 'view-full/:id', component: ViewFullComponent, canActivate: [AuthGuard] },
    { path: 'joining-list', component: JoiningListComponent, canActivate: [AuthGuard] },
    { path: 'add', component: AddComponent, canActivate: [AuthGuard] },
    { path: 'verify/:id/:id2', component: VerifyComponent, canActivate: [AuthGuard] },
    { path: 'confirm-joining/:id', component: ConfirmJoiningComponent, canActivate: [AuthGuard] },
    { path: 'hr-entry/:id', component: HrEntryComponent, canActivate: [AuthGuard] },
    { path: 'edit-full/:id', component: EditFullComponent, canActivate: [AuthGuard] },
    { path: 'accept/:id/:id2', component: AcceptComponent },
    { path: 'joining-report/:id', component: JoiningReportComponent, canActivate: [AuthGuard] },
    { path: 'activity-report', component: ActivityReportComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }