import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { OffersModule } from '../Offer/offers.module';
import { HRSharedModule } from '../shared/hr-shared.module';
import { TransferRoutingModule } from './transfer-routing.module';
import { SelectEmployeeComponent } from '../../HR/transfer/select-employee/select-employee.component';
import { HistoryComponent } from '../../HR/transfer/history/history.component';
import { PrintComponent } from '../../HR/transfer/print/print.component';
import { DetailsComponent } from './details/details.component';
import { ViewComponent } from '../../HR/transfer/view/view.component';
import { ListComponent } from '../../HR/transfer/list/list.component';
import { PendingListComponent } from '../../HR/transfer/pending-list/pending-list.component';
import { ApproveComponent } from '../../HR/transfer/approve/approve.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        HRSharedModule,
        TransferRoutingModule
    ],

    declarations: [
        SelectEmployeeComponent,
        DetailsComponent,
        HistoryComponent,
        PrintComponent,
        ViewComponent,
        ListComponent,
        PendingListComponent,
        ApproveComponent],
    exports: [

    ]

})

export class TransferModule { }