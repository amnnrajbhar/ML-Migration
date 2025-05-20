import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountReportsComponent } from './AccountReports.component';
import { AccountReportsRoutingModule } from './AccountReports-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        AccountReportsRoutingModule
    ],
    declarations: [AccountReportsComponent],
     providers: [DatePipe]
})
export class AccountReportsModule { }
