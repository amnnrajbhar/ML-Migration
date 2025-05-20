import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { FinanceApprovalRoutingModule } from './FinanceApproval-routing.module';
import { FinanceApprovalComponent } from './FinanceApproval.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        FinanceApprovalRoutingModule
    ],
    declarations: [
        FinanceApprovalComponent
    ],
    providers:[
        DatePipe
    ]
})
export class FinanceApprovalModule { }
