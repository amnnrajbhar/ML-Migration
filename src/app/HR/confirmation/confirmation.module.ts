import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationRoutingModule } from './confirmation-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

import { ListComponent } from './list/list.component';
import {ConfirmedemployeelistListComponent } from './confirmemployeelist/confirmemployeelist.component';
// import { ProfileComponent } from './profile/profile.component';
// import { DocumentsComponent } from '../../HR/Employee/documents/documents.component';
import { ESSModule} from '../ESS/ess.module';
import { HRSharedModule} from '../shared/hr-shared.module';
import { DetailComponent } from '../../HR/confirmation/detail/detail.component';
import { ConfirmationpendingtaskComponent } from '../../HR/confirmation/confirmationpendingtask/confirmationpendingtask.component';
import { ConfirmationPrintComponent } from '../../HR/confirmation/confirmation-print/confirmation-print.component';
import { ConfirmationDetailComponent } from '../../HR/confirmation/confirmation-detail/confirmation-detail.component';
import { ConfirmationHodRecommendationsComponent } from '../../HR/confirmation/confirmation-hod-recommendations/confirmation-hod-recommendations.component';
import { ConfirmationEmployeeSalaryComponent } from '../../HR/confirmation/confirmation-employee-salary/confirmation-employee-salary.component';
import { ConfirmationEmployeeReadonlysalaryComponent } from '../../HR/confirmation/confirmation-employee-readonlysalary/confirmation-employee-readonlysalary.component';
import { ViewComponent } from '../../HR/confirmation/view/view.component';
import { ApproveComponent } from '../../HR/confirmation/approve/approve.component';
import { HistoryComponent } from '../../HR/confirmation/history/history.component';
//import { EditConfirmationComponent } from '../../HR/confirmation/edit-confirmation/edit-confirmation.component';
import { ReportListComponent } from '../../HR/confirmation/report-list/report-list.component';
import { ReportSummaryComponent } from '../../HR/confirmation/report-summary/report-summary.component';
import { EmployeeModule } from '../Employee/employee.module';
import { BulkConfirmationComponent } from '../../HR/confirmation/bulk-confirmation/bulk-confirmation.component';

@NgModule({
  imports: [
    CommonModule,    
    FormsModule,
    SharedmoduleModule,
    ConfirmationRoutingModule,
    ESSModule,
    HRSharedModule,
    EmployeeModule
  ],
  declarations: [
    ListComponent,
    ConfirmedemployeelistListComponent,
    DetailComponent,
    ConfirmationpendingtaskComponent,
    ConfirmationPrintComponent,
    ConfirmationDetailComponent,
    ConfirmationHodRecommendationsComponent,
    ConfirmationEmployeeSalaryComponent,
    ConfirmationEmployeeReadonlysalaryComponent,
    ViewComponent,
    ApproveComponent,
    HistoryComponent,
    //EditConfirmationComponent,
    ReportListComponent,
    ReportSummaryComponent,
    BulkConfirmationComponent
    // DocumentsComponent
  ],
  exports: [    
  ]
})
export class ConfirmationModule { }
