import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { DCCancellationComponent } from './DCCancellation.component';
import { DCCancellationRoutingModule } from './DCCancellation-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    DCCancellationRoutingModule
  ],
  declarations: [
    DCCancellationComponent
  ],
  providers: [
    DatePipe
  ]
})
export class DCCancellationModule { }
