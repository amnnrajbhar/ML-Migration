import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { OffersModule } from '../Offer/offers.module';
import { HRSharedModule} from '../shared/hr-shared.module';
import { TerminationRoutingModule } from './termination-routing.module';
import { SelectEmployeeComponent } from './select-employee/select-employee.component';
import { TerminationComponent } from './termination/termination.component';
import { TerminationListComponent } from './termination-list/termination-list.component';
import { ViewTerminationComponent } from './view-termination/view-termination.component';
import { PendingTerminationListComponent } from './pending-termination-list/pending-termination-list.component';
import { ViewPendingTerminationComponent } from './view-pending-termination/view-pending-termination.component';
import { PrintExitComponent } from './print-exit/print-exit.component';
import { PrintExitInterviewComponent } from './print-exit-interview/print-exit-interview.component';
import { ClearanceChecklistComponent } from './clearance-checklist/clearance-checklist.component';
import { ExitInterviewComponent } from './exit-interview/exit-interview.component';
import { InitiateExitComponent } from './initiate-exit/initiate-exit.component';
import { TerminationChecklistComponent } from '../../HR/termination/termination-checklist/termination-checklist.component';
import { HistoryComponent } from '../../HR/termination/history/history.component';
import { EditTerminationComponent } from './edit-termination/edit-termination.component';
import { CompleteExitComponent } from './complete-exit/complete-exit.component';

@NgModule({
    imports: [
        CommonModule,    
        FormsModule,
        SharedmoduleModule,
        TerminationRoutingModule,
        HRSharedModule,
],
        
declarations: [
    SelectEmployeeComponent,
    TerminationComponent,
    TerminationListComponent,
    ViewTerminationComponent,
    PendingTerminationListComponent,
    ViewPendingTerminationComponent,
    PrintExitComponent,
    PrintExitInterviewComponent,
    ClearanceChecklistComponent,
    ExitInterviewComponent,
    InitiateExitComponent,
    TerminationChecklistComponent,
    HistoryComponent,
    EditTerminationComponent,
    CompleteExitComponent],
    exports: [    

    ]
   
})

export class TerminationModule{}