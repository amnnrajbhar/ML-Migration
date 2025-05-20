import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookRoomComponent } from './book-room.component';
import { BookRoomRoutingModule } from './book-room-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    BookRoomRoutingModule
  ],
  declarations: [
    BookRoomComponent
  ]
})
export class BookRoomModule { }
