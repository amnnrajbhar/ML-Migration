import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordpolicyRoutingModule } from './passwordpolicy-routing.module';
import { PasswordpolicyComponent } from './passwordpolicy.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PasswordpolicyRoutingModule
  ],
  declarations: [PasswordpolicyComponent]
})
export class PasswordpolicyModule { }
