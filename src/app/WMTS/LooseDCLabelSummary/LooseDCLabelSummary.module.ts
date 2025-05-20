import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { LooseDCLabelSummaryComponent } from './LooseDCLabelSummary.component';
import { LooseDCLabelSummaryRoutingModule } from './LooseDCLabelSummary-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    LooseDCLabelSummaryRoutingModule,
  ],
  declarations: [
    LooseDCLabelSummaryComponent
  ],
  providers:[DatePipe]
})
export class LooseDCLabelSummaryModule { }
