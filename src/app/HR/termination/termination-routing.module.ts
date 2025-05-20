import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
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
import { EditTerminationComponent } from './edit-termination/edit-termination.component';
import { CompleteExitComponent } from './complete-exit/complete-exit.component';

const routes: Routes = [
    { path: 'termination/:id', component: TerminationComponent, canActivate: [AuthGuard] },
    { path: 'termination-list', component: TerminationListComponent, canActivate: [AuthGuard] },
    { path: 'select-employee', component: SelectEmployeeComponent, canActivate: [AuthGuard] },
    { path: 'view-termination/:id', component: ViewTerminationComponent, canActivate: [AuthGuard] },
    { path: 'pending-termination-list', component: PendingTerminationListComponent, canActivate: [AuthGuard] },
    { path: 'view-pending-termination/:id1/:id2', component: ViewPendingTerminationComponent, canActivate: [AuthGuard] },
    { path: 'clearance-checklist', component: ClearanceChecklistComponent, canActivate: [AuthGuard] },
    { path: 'print-exit/:id', component: PrintExitComponent, canActivate: [AuthGuard] },
    { path: 'initiate-exit/:id', component: InitiateExitComponent, canActivate: [AuthGuard] },
    { path: 'print-exit-interview/:id', component: PrintExitInterviewComponent, canActivate: [AuthGuard] },
    { path: 'edit-termination/:id', component: EditTerminationComponent, canActivate: [AuthGuard] },
    { path: 'complete-exit/:id', component: CompleteExitComponent, canActivate: [AuthGuard] },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TerminationRoutingModule { }
