import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionsRoutingModule } from './actions-routing.module';
import { ESSModule } from '../ESS/ess.module';
import { HRSharedModule } from '../shared/hr-shared.module';
import { AppraisalComponent } from '../../HR/actions/appraisal/appraisal.component';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { EmployeeSalaryComponent } from '../../HR/actions/employee-salary/employee-salary.component';
import { ReadonlyemployeeSalaryComponent } from '../../HR/actions/readonlyemployee-salary/readonlyemployee-salary.component';
import { AppraisalEmployeelistComponent } from '../../HR/actions/appraisal-employeelist/appraisal-employeelist.component';
import { AppraisalPendingtasksComponent } from '../../HR/actions/appraisal-pendingtasks/appraisal-pendingtasks.component';
import { AppraisalInitialdetailComponent } from '../../HR/actions/appraisal-initialdetail/appraisal-initialdetail.component';
import { AppraisalInitialreviewlistComponent } from '../../HR/actions/appraisal-initialreviewlist/appraisal-initialreviewlist.component';
import { AppraisalworkflowPendingtasksComponent } from '../../HR/actions/appraisalworkflow-pendingtasks/appraisalworkflow-pendingtasks.component';
import { AppraisalViewComponent } from '../../HR/actions/appraisal-view/appraisal-view.component';
import { AppraisalViewOnlyComponent } from '../../HR/actions/appraisal-view-only/appraisal-view-only.component';
import { AppraisalHodRecommendationsComponent } from '../../HR/actions/appraisal-hod-recommendations/appraisal-hod-recommendations.component';
import { AppraisalPrintComponent } from '../../HR/actions/appraisal-print/appraisal-print.component';
import { BulkAppraisalComponent } from '../../HR/actions/bulk-appraisal/bulk-appraisal.component';
import { AppraisalHistoryComponent } from '../../HR/actions/appraisal-history/appraisal-history.component';
import { ReportListComponent } from '../../HR/actions/report-list/report-list.component';
import { EmployeeModule } from '../Employee/employee.module';

@NgModule({
  imports: [
    CommonModule,
    SharedmoduleModule,
    ActionsRoutingModule,
    ESSModule,
    HRSharedModule,
    EmployeeModule
  ],
  declarations: [
     AppraisalComponent,
     EmployeeSalaryComponent,
     ReadonlyemployeeSalaryComponent,
     AppraisalEmployeelistComponent,
     AppraisalPendingtasksComponent,
     AppraisalInitialdetailComponent,
     AppraisalInitialreviewlistComponent,
     AppraisalworkflowPendingtasksComponent,
     AppraisalViewComponent,
     AppraisalViewOnlyComponent,
     AppraisalHodRecommendationsComponent,
     AppraisalPrintComponent,
     BulkAppraisalComponent,
     AppraisalHistoryComponent,
     ReportListComponent
  ]
})
export class ActionsModule { }
