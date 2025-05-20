import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { NewOfferComponent } from './new-offer/new-offer.component';
import { ViewOfferComponent } from './view-offer/view-offer.component';
import { EditOfferComponent } from './edit-offer/edit-offer.component';
import { PrintOfferComponent } from './print-offer/print-offer.component';
import { OfferListComponent } from './offer-list/offer-list.component';
import { PendingTasksComponent } from '../pending-tasks/pending-tasks.component';
import { AcceptOfferComponent } from './accept-offer/accept-offer.component';
import { OfferSalaryComponent } from '../offersalary/offersalary.component';
import { ApproveComponent } from '../Offer/approve/approve.component';
import { PrintApprovalComponent } from '../../HR/Offer/print-approval/print-approval.component';
import { ReportListComponent } from '../../HR/Offer/report-list/report-list.component';
import { ReportSummaryComponent } from '../../HR/Offer/report-summary/report-summary.component';
import { DashboardComponent } from '../../HR/Offer/dashboard/dashboard.component';

const routes: Routes = [
    { path: 'new-offer', component: NewOfferComponent, canActivate: [AuthGuard] },
    { path: 'view-offer/:id', component: ViewOfferComponent, canActivate: [AuthGuard] },
    { path: 'edit-offer/:id', component: EditOfferComponent, canActivate: [AuthGuard] },
    { path: 'print-offer/:id', component: PrintOfferComponent, canActivate: [AuthGuard] },
    { path: 'print-approval/:id', component: PrintApprovalComponent, canActivate: [AuthGuard] },
    { path: 'accept-offer/:id/:id2', component: AcceptOfferComponent},
    { path: 'offer-list', component: OfferListComponent, canActivate: [AuthGuard] },
    { path: 'pending-tasks', component: PendingTasksComponent, canActivate: [AuthGuard] } ,
    // { path: 'OfferSalary', component: OfferSalaryComponent, canActivate: [AuthGuard] } ,    
    { path: 'approve-offer/:id/:id2', component: ApproveComponent, canActivate: [AuthGuard]},    
    { path: 'report-list', component: ReportListComponent, canActivate: [AuthGuard] },
    { path: 'report-summary', component: ReportSummaryComponent, canActivate: [AuthGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OffersRoutingModule { }
