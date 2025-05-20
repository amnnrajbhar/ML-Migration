import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResetPasswordComponent } from './resetpassword.component';
import { ResetPasswordRoutingModule } from './resetpassword-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ResetPasswordRoutingModule
  ],
  declarations: [
    ResetPasswordComponent
  ]
})
export class ResetPasswordModule { }
