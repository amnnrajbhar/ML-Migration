import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsgBoardComponent } from './message-board.component';
import { FormsModule } from '@angular/forms';
import { MessageboardRoutingModule } from './messageboard-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MessageboardRoutingModule
  ],
  declarations: [
    MsgBoardComponent
  ]
})
export class MessageboardModule { }
