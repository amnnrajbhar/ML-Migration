import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MailconfigurationRoutingModule } from './mailconfiguration-routing.module';
import { MailconfigurationComponent } from './mailconfiguration.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MailconfigurationRoutingModule
  ],
  declarations: [MailconfigurationComponent]
})
export class MailconfigurationModule { }
