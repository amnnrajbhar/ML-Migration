import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { OffersModule } from '../Offer/offers.module';
import { HRSharedModule} from '../shared/hr-shared.module';
import { RetirementRoutingModule } from './retirement-routing.module';
import { RetirementListComponent } from '../../HR/retirement/retirement-list/retirement-list.component';
import { RetirementExtensionComponent } from '../../HR/retirement/retirement-extension/retirement-extension.component';
import { ViewExtensionListComponent } from '../../HR/retirement/view-extension-list/view-extension-list.component';
import { ViewExtensionComponent } from '../../HR/retirement/view-extension/view-extension.component';
import { PendingExtensionListComponent } from '../../HR/retirement/pending-extension-list/pending-extension-list.component';
import { PendingExtensionApprovalComponent } from '../../HR/retirement/pending-extension-approval/pending-extension-approval.component';
import { HistoryComponent } from '../../HR/retirement/history/history.component';
import { PrintRetirementComponent } from '../../HR/retirement/print-retirement/print-retirement.component';
import { EditRetirementComponent } from './edit-retirement/edit-retirement.component';
import { RetirementListReportComponent } from '../../HR/retirement/retirement-list-report/retirement-list-report.component';
import { PrintExtensionComponent } from '../../HR/retirement/print-extension/print-extension.component';


@NgModule({
    imports: [
        CommonModule,    
        FormsModule,
        SharedmoduleModule,
        RetirementRoutingModule,
        HRSharedModule,
],
        
    declarations: [
             RetirementListComponent,
             RetirementExtensionComponent,
             ViewExtensionListComponent,
             ViewExtensionComponent,
             PendingExtensionListComponent,
             PendingExtensionApprovalComponent,
             HistoryComponent,
             PrintRetirementComponent,
             EditRetirementComponent,
             RetirementListReportComponent,
             PrintExtensionComponent],
        exports: [    
            HistoryComponent,
        ]
       
})

export class RetirementModule{}