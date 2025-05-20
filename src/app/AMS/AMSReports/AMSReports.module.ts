import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AMSReportsComponent } from './AMSReports.component';
import { AMSReportsRoutingModule } from './AMSReports-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        AMSReportsRoutingModule
    ],
    declarations: [AMSReportsComponent],
    providers: [DatePipe]
})
export class AMSReportsModule { }
