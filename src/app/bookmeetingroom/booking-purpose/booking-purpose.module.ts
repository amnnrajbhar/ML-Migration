import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingPurposeComponent } from './booking-purpose.component';
import { BookingPurposeRoutingModule } from './booking-purpose-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    BookingPurposeRoutingModule
  ],
  declarations: [
    BookingPurposeComponent
  ]
})
export class BookingPurposeModule { }
