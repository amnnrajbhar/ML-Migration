import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { OffersModule } from '../Offer/offers.module';
import { HRSharedModule} from '../shared/hr-shared.module';
import { SelectEmployeeComponent } from '../../HR/recall/select-employee/select-employee.component';
import { RecallRoutingModule } from './recall-routing.module';
import { RecallComponent } from '../../HR/recall/recall/recall.component';
import { EmployeeSalaryComponent } from '../../HR/recall/employee-salary/employee-salary.component';
import { ReadonlyemployeeSalaryComponent } from '../../HR/recall/readonlyemployee-salary/readonlyemployee-salary.component';
import { RecallListComponent } from '../../HR/recall/recall-list/recall-list.component';
import { PendingRecallComponent } from '../../HR/recall/pending-recall/pending-recall.component';
import { ViewRecallComponent } from '../../HR/recall/view-recall/view-recall.component';
import { PendingRecallApprovalComponent } from './pending-recall-approval/pending-recall-approval.component';
import { HistoryComponent } from './history/history.component';
import { EditRecallComponent } from './edit-recall/edit-recall.component';
import { PrintRecallComponent } from './print-recall/print-recall.component';
import { RecallEmployeeSalaryComponent } from './recall-employee-salary/recall-employee-salary.component';
import { RecallListReportComponent } from '../../HR/recall/recall-list-report/recall-list-report.component';


@NgModule({
    imports: [
        CommonModule,    
        FormsModule,
        SharedmoduleModule,
        RecallRoutingModule,
        HRSharedModule,
],
        
    declarations: [
        SelectEmployeeComponent,
        RecallComponent,
        EmployeeSalaryComponent,
        ReadonlyemployeeSalaryComponent,
        RecallListComponent,
        PendingRecallComponent,
        ViewRecallComponent,
        PendingRecallApprovalComponent,
        HistoryComponent,
        EditRecallComponent,
        PrintRecallComponent,
        RecallEmployeeSalaryComponent,
        RecallListReportComponent
    ],
        exports: [    

        ]
       
})

export class RecallModule{}