import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeRoutingModule } from './employee-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { HRSharedModule} from '../shared/hr-shared.module';

import { ListComponent } from './list/list.component';
import { ProfileComponent } from './profile/profile.component';
import { DocumentsComponent } from '../../HR/Employee/documents/documents.component';
import { ESSModule} from '../ESS/ess.module';
import { BulkEmployeeListComponent } from '../../HR/Employee/BulkEmployee/bulk-employee-list/bulk-employee-list.component';
import { PlantPayGroupBulkUpdateComponent } from '../../HR/Employee/plant-pay-group-bulk-update/plant-pay-group-bulk-update.component';
import { ReportListComponent } from '../../HR/Employee/report-list/report-list.component';
import { ReportCtcSummaryComponent } from '../../HR/Employee/report-ctc-summary/report-ctc-summary.component';
import { DashboardComponent } from '../../HR/Employee/dashboard/dashboard.component';
import { EditComponent } from '../../HR/Employee/edit/edit.component';
import { ViewComponent } from '../../HR/Employee/view/view.component';
import { UpdateListComponent } from '../../HR/Employee/update-list/update-list.component';
import { UpdateViewComponent } from '../../HR/Employee/update-view/update-view.component';

@NgModule({
  imports: [
    CommonModule,    
    FormsModule,
    SharedmoduleModule,
    EmployeeRoutingModule,
    HRSharedModule,
    ESSModule
  ],
  declarations: [
    ListComponent,
    ProfileComponent,
    DocumentsComponent,
    BulkEmployeeListComponent,
    PlantPayGroupBulkUpdateComponent,
    ReportListComponent,
    ReportCtcSummaryComponent,
    DashboardComponent,
    EditComponent,
    ViewComponent,
    UpdateListComponent,
    UpdateViewComponent,
  ],
  exports: [  
  ]
})
export class EmployeeModule { }
