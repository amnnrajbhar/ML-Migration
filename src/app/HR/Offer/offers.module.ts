import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OffersRoutingModule } from './offers-routing.module';
import { NewOfferComponent } from './new-offer/new-offer.component';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { OfferListComponent } from './offer-list/offer-list.component';
import { PendingTasksComponent } from '../pending-tasks/pending-tasks.component';
import { ViewOfferComponent } from './view-offer/view-offer.component';
import { PrintOfferComponent } from './print-offer/print-offer.component';
import { EditOfferComponent } from './edit-offer/edit-offer.component';
import { AcceptOfferComponent } from './accept-offer/accept-offer.component';
import { ChecklistComponent } from '../../HR/Offer/checklist/checklist.component';
import { OfferSalaryComponent } from '../offersalary/offersalary.component';

import { ApproveComponent } from '../../HR/Offer/approve/approve.component';
import { HRSharedModule} from '../shared/hr-shared.module';
import { AdditionalInfoComponent } from '../../HR/Offer/additional-info/additional-info.component';
import { PrintApprovalComponent } from '../../HR/Offer/print-approval/print-approval.component';
import { ReportListComponent } from '../../HR/Offer/report-list/report-list.component';
import { ReportSummaryComponent } from '../../HR/Offer/report-summary/report-summary.component';
import { DashboardComponent } from '../../HR/Offer/dashboard/dashboard.component';
import { AttachmentsComponent } from '../../HR/Offer/attachments/attachments.component';

@NgModule({
  imports: [
    CommonModule,    
    FormsModule,
    SharedmoduleModule,
    OffersRoutingModule,
    HRSharedModule
  ],
  declarations: [
    NewOfferComponent,
    OfferListComponent,
    PendingTasksComponent,
    ViewOfferComponent,
    PrintOfferComponent,
    EditOfferComponent,
    AcceptOfferComponent,
    ChecklistComponent,
    OfferSalaryComponent,
    ApproveComponent,
    AdditionalInfoComponent,
    PrintApprovalComponent,
    ReportListComponent,
    ReportSummaryComponent,
    DashboardComponent,
    AttachmentsComponent
  ]
})
export class OffersModule { }
