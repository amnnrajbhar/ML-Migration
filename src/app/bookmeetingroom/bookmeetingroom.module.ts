import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookmeetingroomRoutingModule } from './bookmeetingroom-routing.module';
// import { RoomBookingComponent } from './room-booking/room-booking.component';
// import { BookRoomComponent } from './book-room/book-room.component';
// import { MymeetingsComponent } from './mymeetings/mymeetings.component';
// import { ManagerapprovalComponent } from './managerapproval/managerapproval.component';
// import { AdminapprovalComponent } from './adminapproval/adminapproval.component';
// import { BookingPurposeComponent } from './booking-purpose/booking-purpose.component';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    BookmeetingroomRoutingModule
  ],
  declarations: [
    // AdminapprovalComponent,
    // BookRoomComponent,
    // BookingPurposeComponent,
    // ManagerapprovalComponent,
    // MymeetingsComponent

  ]
})
export class BookmeetingroomModule { }
