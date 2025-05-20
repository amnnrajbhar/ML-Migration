import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { UserIdRequestReportRoutingModule } from './UserIdRequestReport-routing.module';
import { UserIdRequestReportComponent } from './UserIdRequestReport.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    UserIdRequestReportRoutingModule
  ],
  declarations: [
    UserIdRequestReportComponent
  ],
  providers:[
    DatePipe
  ]
})
export class UserIdRequestReportModule { }
