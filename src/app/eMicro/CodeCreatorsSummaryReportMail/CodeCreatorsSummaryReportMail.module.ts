import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CodeCreatorsSummaryReportMailRoutingModule } from './CodeCreatorsSummaryReportMail-routing.module';
import { CodeCreatorsSummaryReportMailComponent } from './CodeCreatorsSummaryReportMail.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        CodeCreatorsSummaryReportMailRoutingModule,
        
    ],
    declarations: [
        CodeCreatorsSummaryReportMailComponent
    ],
    providers: [
        DatePipe
    ]
})
export class CodeCreatorsSummaryReportMailModule { }
