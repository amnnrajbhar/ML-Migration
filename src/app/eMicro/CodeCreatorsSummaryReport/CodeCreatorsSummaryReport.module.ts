import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CodeCreatorsSummaryReportRoutingModule } from './CodeCreatorsSummaryReport-Routing.module';
import { CodeCreatorsSummaryReportComponent } from './CodeCreatorsSummaryReport.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        CodeCreatorsSummaryReportRoutingModule,
        
    ],
    declarations: [
        CodeCreatorsSummaryReportComponent
    ]
})
export class CodeCreatorsSummaryReportModule { }
