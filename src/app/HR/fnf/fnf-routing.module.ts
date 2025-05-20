import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { InitiateFnfListComponent } from '../../HR/fnf/initiate-fnf-list/initiate-fnf-list.component';
import { InitiateFnfComponent } from '../../HR/fnf/initiate-fnf/initiate-fnf.component';
import { PendingFnfListComponent } from './pending-fnf-list/pending-fnf-list.component';
import { ViewFnfListComponent } from './view-fnf-list/view-fnf-list.component';
import { PrintFnfComponent } from './print-fnf/print-fnf.component';
import { ViewFnfComponent } from './view-fnf/view-fnf.component';
import { PendingFnfApprovalComponent } from './pending-fnf-approval/pending-fnf-approval.component';
import { FnfApprovalListComponent } from '../../HR/fnf/fnf-approval-list/fnf-approval-list.component';
import { EditFnfComponent } from './edit-fnf/edit-fnf.component';

const routes: Routes = [
    { path: 'initiate-fnf-list', component: InitiateFnfListComponent, canActivate: [AuthGuard] }, 
    { path: 'initiate-fnf/:id', component: InitiateFnfComponent, canActivate: [AuthGuard]},
    { path: 'initiate-fnf/:id/:id2', component: InitiateFnfComponent, canActivate: [AuthGuard]},
    { path: 'view-fnf-list', component: ViewFnfListComponent, canActivate: [AuthGuard] },
    { path: 'pending-fnf-list', component: PendingFnfListComponent, canActivate: [AuthGuard] },  
    { path: 'print-fnf/:id/:id2', component: PrintFnfComponent, canActivate: [AuthGuard] },  
    { path: 'view-fnf/:id/:id2', component: ViewFnfComponent, canActivate: [AuthGuard]},   
    { path: 'pending-fnf-approval/:id/:id2/:id3', component: PendingFnfApprovalComponent, canActivate: [AuthGuard]},
    { path: 'fnf-approval-list', component: FnfApprovalListComponent, canActivate: [AuthGuard] },  
    { path: 'edit-fnf/:id/:id2', component: EditFnfComponent, canActivate: [AuthGuard] },                    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FnFRoutingModule { }
