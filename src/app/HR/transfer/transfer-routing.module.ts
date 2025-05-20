import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { DetailsComponent } from './details/details.component';
import { SelectEmployeeComponent } from '../../HR/transfer/select-employee/select-employee.component';
import { HistoryComponent } from '../../HR/transfer/history/history.component';
import { PrintComponent } from '../../HR/transfer/print/print.component';
import { ViewComponent } from '../../HR/transfer/view/view.component';
import { ListComponent } from '../../HR/transfer/list/list.component';
import { PendingListComponent } from '../../HR/transfer/pending-list/pending-list.component';
import { ApproveComponent } from '../../HR/transfer/approve/approve.component';

const routes: Routes = [
    { path: 'select-employee', component: SelectEmployeeComponent, canActivate: [AuthGuard] },
    { path: 'details/:id/:id2/:id3', component: DetailsComponent, canActivate: [AuthGuard] },
    { path: 'print/:id', component: PrintComponent, canActivate: [AuthGuard] },
    { path: 'view/:id', component: ViewComponent, canActivate: [AuthGuard] },
    { path: 'list', component: ListComponent, canActivate: [AuthGuard] },
    { path: 'pending-list', component: PendingListComponent, canActivate: [AuthGuard] },
    { path: 'approve/:id/:id2', component: ApproveComponent, canActivate: [AuthGuard] },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransferRoutingModule { }
