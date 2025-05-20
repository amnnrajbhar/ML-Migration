import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { UserIDSummaryReportComponent } from './UserIDSummaryReport.component';
import { UserIDSummaryReportRoutingModule } from './UserIDSummaryReport-routing.module';
import {MatSelectModule} from '@angular/material/select';


@NgModule({
  exports:[
    MatSelectModule,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    UserIDSummaryReportRoutingModule
  ],
  declarations: [
    UserIDSummaryReportComponent
  ],
  providers:[
    DatePipe
  ]
})
export class UserIDSummaryReportModule { }
