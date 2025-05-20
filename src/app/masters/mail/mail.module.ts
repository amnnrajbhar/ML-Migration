import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailComponent } from './mail.component';
import { FormsModule } from '@angular/forms';
import { MailRoutingModule } from './mail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MailRoutingModule
  ],
  declarations: [
    MailComponent
  ]
})
export class MailModule { }
