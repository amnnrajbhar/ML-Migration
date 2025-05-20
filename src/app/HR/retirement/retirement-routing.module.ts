import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { RetirementListComponent } from '../../HR/retirement/retirement-list/retirement-list.component';
import { RetirementExtensionComponent } from '../../HR/retirement/retirement-extension/retirement-extension.component';
import { ViewExtensionListComponent } from '../../HR/retirement/view-extension-list/view-extension-list.component';
import { ViewExtensionComponent } from '../../HR/retirement/view-extension/view-extension.component';
import { PendingExtensionListComponent } from '../../HR/retirement/pending-extension-list/pending-extension-list.component';
import { PendingExtensionApprovalComponent } from '../../HR/retirement/pending-extension-approval/pending-extension-approval.component';
import { PrintRetirementComponent } from '../../HR/retirement/print-retirement/print-retirement.component';
import { EditRetirementComponent } from './edit-retirement/edit-retirement.component';
import { RetirementListReportComponent } from '../../HR/retirement/retirement-list-report/retirement-list-report.component';
import { PrintExtensionComponent } from '../../HR/retirement/print-extension/print-extension.component';

const routes: Routes = [
    { path: 'retirement-list', component: RetirementListComponent, canActivate: [AuthGuard] },
    { path: 'retirement-extension/:id', component: RetirementExtensionComponent, canActivate: [AuthGuard] },
    { path: 'view-extension-list', component: ViewExtensionListComponent, canActivate: [AuthGuard] },
    { path: 'view-extension/:id/:id2', component: ViewExtensionComponent, canActivate: [AuthGuard] },
    { path: 'pending-extension-list', component: PendingExtensionListComponent, canActivate: [AuthGuard] },
    { path: 'pending-extension-approval/:id/:id2/:id3', component: PendingExtensionApprovalComponent, canActivate: [AuthGuard] },
    { path: 'print-retirement/:id', component: PrintRetirementComponent, canActivate: [AuthGuard] },
    { path: 'print-extension/:id/:id2', component: PrintExtensionComponent, canActivate: [AuthGuard] },
    { path: 'edit-retirement/:id/:id2', component: EditRetirementComponent, canActivate: [AuthGuard] },
    { path: 'retirement-list-report', component: RetirementListReportComponent, canActivate: [AuthGuard] },

  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RetirementRoutingModule { }
