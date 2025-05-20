import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialReportComponent } from './FinancialReport.component';
import { FinancialReportRoutingModule } from './FinancialReport-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        FinancialReportRoutingModule,
        NgSelectModule
    ],
    declarations: [FinancialReportComponent],
     providers: [DatePipe]
})
export class FinancialReportModule { }
