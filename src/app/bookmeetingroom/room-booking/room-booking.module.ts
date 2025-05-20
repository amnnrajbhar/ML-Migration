import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomBookingComponent } from './room-booking.component';
import { RoomBookingRoutingModule } from './room-booking-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
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
    RoomBookingRoutingModule
  ],
  declarations: [
    RoomBookingComponent
  ]
})
export class RoomBookingModule { }
