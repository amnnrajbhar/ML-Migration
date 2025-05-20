import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SecurityVerificationReportComponent } from './SecurityVerificationReport.component';
import { SecurityVerificationReportRoutingModule } from './SecurityVerificationReport-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    SecurityVerificationReportRoutingModule,
  ],
  declarations: [
    SecurityVerificationReportComponent
  ],
  providers:[DatePipe]
})
export class SecurityVerificationReportModule { }
