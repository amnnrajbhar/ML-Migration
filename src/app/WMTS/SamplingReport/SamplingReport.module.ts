import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SamplingReportComponent } from './SamplingReport.component';
import { SamplingReportRoutingModule } from './SamplingReport-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    SamplingReportRoutingModule,
  ],
  declarations: [
    SamplingReportComponent
  ],
  providers:[DatePipe]
})
export class SamplingReportModule { }
