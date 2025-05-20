import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { UserIDDetailedReportComponent } from './UserIDDetailedReport.component';
import { UserIDDetailedReportRoutingModule } from './UserIDDetailedReport-routing.module';
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
    UserIDDetailedReportRoutingModule
  ],
  declarations: [
    UserIDDetailedReportComponent
  ],
  providers:[
    DatePipe
  ]
})
export class UserIDDetailedReportModule { }
