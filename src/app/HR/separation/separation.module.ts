import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { SeparationRoutingModule} from './separation-routing.module';
import { ResignationComponent} from '../../HR/separation/resignation/resignation.component';
import { ResignationListComponent } from '../../HR/separation/resignation-list/resignation-list.component';
import { SelectEmployeeComponent } from '../../HR/separation/select-employee/select-employee.component';
import { ViewResignationComponent } from '../../HR/separation/view-resignation/view-resignation.component';
import { EditResignationComponent } from './edit-resignation/edit-resignation.component';
import { PendingResignationComponent } from './pending-resignation/pending-resignation.component';
import { EditResignationApproverComponent } from './edit-resignation-approver/edit-resignation-approver.component';
import { ResignationChecklistComponent } from './resignation-checklist/resignation-checklist.component';
import { ClearanceChecklistComponent } from './clearance-checklist/clearance-checklist.component';
import { PrintExitComponent } from './print-exit/print-exit.component';
import { OffersModule } from '../Offer/offers.module';

import { HRSharedModule} from '../shared/hr-shared.module';
import { InitiateExitComponent } from '../../HR/separation/initiate-exit/initiate-exit.component';
import { HistoryComponent } from '../../HR/separation/history/history.component';
import { ExitInterviewTemplatesComponent } from '../../HR/separation/exit-interview-templates/exit-interview-templates.component';
import { ExitInterviewComponent } from '../../HR/separation/exit-interview/exit-interview.component';
import { PrintExitInterviewComponent } from '../../HR/separation/print-exit-interview/print-exit-interview.component';
import { CompleteExitComponent } from '../../HR/separation/complete-exit/complete-exit.component';
import { ExitInterviewListComponent } from '../../HR/separation/exit-interview-list/exit-interview-list.component';
import { ExitInterviewLinkComponent } from '../../HR/separation/exit-interview-link/exit-interview-link.component';
import { ResignationListReportComponent } from '../../HR/separation/resignation-list-report/resignation-list-report.component';
import { AttirationReportComponent } from '../../HR/separation/attiration-report/attiration-report.component';
import { PaymentListComponent } from '../../HR/separation/payment-list/payment-list.component';
import { AddPaymentComponent } from '../../HR/separation/add-payment/add-payment.component';
import { DashboardComponent } from '../../HR/separation/dashboard/dashboard.component';
import { ResignationPrintComponent } from '../../HR/separation/resignation-print/resignation-print.component';
import { ShortfallDetailsComponent } from '../../HR/separation/shortfall-details/shortfall-details.component';
import { ChecklistComponent } from '../../HR/separation/checklist/checklist.component';


@NgModule({
    imports: [
        CommonModule,    
        FormsModule,
        SharedmoduleModule,
        SeparationRoutingModule,
        HRSharedModule
],
        
    declarations: [
        ResignationComponent,
        ResignationListComponent,
        SelectEmployeeComponent,
        ViewResignationComponent,
        EditResignationComponent,
        PendingResignationComponent,
        EditResignationApproverComponent,
        ResignationChecklistComponent,
        ClearanceChecklistComponent,
        PrintExitComponent,
        InitiateExitComponent,
        HistoryComponent,
        ExitInterviewTemplatesComponent,
        ExitInterviewComponent,
        PrintExitInterviewComponent,
        CompleteExitComponent,
        ExitInterviewListComponent,
        ExitInterviewLinkComponent,
        ResignationListReportComponent,
        AttirationReportComponent,
        PaymentListComponent,
        AddPaymentComponent,
        DashboardComponent,
        ResignationPrintComponent,
        ShortfallDetailsComponent,
        ChecklistComponent,

        ],
        exports: [    
          ResignationChecklistComponent,
          HistoryComponent,
          ExitInterviewComponent,
          ShortfallDetailsComponent
        ]
       
})

export class SeparationModule{}