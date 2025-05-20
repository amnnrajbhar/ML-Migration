import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { AppraisalComponent } from '../../HR/actions/appraisal/appraisal.component';
import { AppraisalEmployeelistComponent } from '../../HR/actions/appraisal-employeelist/appraisal-employeelist.component';
import { AppraisalPendingtasksComponent } from '../../HR/actions/appraisal-pendingtasks/appraisal-pendingtasks.component';
import { AppraisalInitialdetailComponent } from './appraisal-initialdetail/appraisal-initialdetail.component';
import { AppraisalInitialreviewlistComponent } from '../../HR/actions/appraisal-initialreviewlist/appraisal-initialreviewlist.component';
import { AppraisalViewComponent } from '../../HR/actions/appraisal-view/appraisal-view.component';
import { AppraisalViewOnlyComponent } from '../../HR/actions/appraisal-view-only/appraisal-view-only.component';
import { AppraisalPrintComponent } from '../../HR/actions/appraisal-print/appraisal-print.component';
import { BulkAppraisalComponent } from '../../HR/actions/bulk-appraisal/bulk-appraisal.component';
//import { AppraisalHistoryComponent } from '../../HR/actions/appraisal-history/appraisal-history.component';
import { AppraisalworkflowPendingtasksComponent } from '../../HR/actions/appraisalworkflow-pendingtasks/appraisalworkflow-pendingtasks.component';
import { ReportListComponent } from '../../HR/actions/report-list/report-list.component';

const routes: Routes = [
 // { path: 'HR/actions/appraisal', component: AppraisalComponent, canActivate: [AuthGuard] },
  { path: 'appraisal-employeelist', component: AppraisalEmployeelistComponent, canActivate: [AuthGuard] },
  { path: 'appraisal-pendingtasks', component: AppraisalPendingtasksComponent, canActivate: [AuthGuard] },
  { path: 'appraisal-initialdetail/:id/:id2/:id3', component: AppraisalInitialdetailComponent, canActivate: [AuthGuard] },
 // { path: 'HR/actions/appraisal-initialdetail', component: AppraisalInitialdetailComponent, canActivate: [AuthGuard] },
  { path: 'appraisal-initialreviewlist', component: AppraisalInitialreviewlistComponent, canActivate: [AuthGuard] },
  { path: 'appraisal/:id/:id2', component: AppraisalComponent, canActivate: [AuthGuard] },
  { path: 'appraisal-view/:id/:id2/:id3', component: AppraisalViewComponent, canActivate: [AuthGuard] },
  { path: 'appraisal-view-only/:id/:id2', component: AppraisalViewOnlyComponent, canActivate: [AuthGuard] },
  { path: 'appraisal-print/:id', component: AppraisalPrintComponent, canActivate: [AuthGuard] },
  { path: 'bulkappraisal', component: BulkAppraisalComponent, canActivate: [AuthGuard] },
  // { path: 'HR/actions/appraisal-history', component: AppraisalHistoryComponent, canActivate: [AuthGuard] },
   { path: 'appraisal-review', component: AppraisalPendingtasksComponent, canActivate: [AuthGuard] },
   { path: 'appraisal-list', component: AppraisalInitialreviewlistComponent, canActivate: [AuthGuard] },
// { path: 'ESS/appraisalrequest', component: AppraisalComponent, canActivate: [AuthGuard] } ,
    // { path: 'initialappraisal', component: AppraisalInitialdetailComponent, canActivate: [AuthGuard] },
    // { path: 'ESS/appraisalsreview', component: AppraisalInitialreviewlistComponent, canActivate: [AuthGuard] },
     { path: 'pending-appraisals', component: AppraisalworkflowPendingtasksComponent, canActivate: [AuthGuard] },
     { path: 'report-list', component: ReportListComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActionsRoutingModule { }