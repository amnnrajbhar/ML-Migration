import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { WorkingCalendarReportsRoutingModule } from './WorkingCalendarReports-routing.module';
import { WorkingCalendarReportsComponent } from './WorkingCalendarReports.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    WorkingCalendarReportsRoutingModule
  ],
  declarations: [WorkingCalendarReportsComponent]
})
export class WorkingCalendarReportsModule { }
