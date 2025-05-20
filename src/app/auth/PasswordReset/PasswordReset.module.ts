import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordResetComponent } from './PasswordReset.component';
import { PasswordResetRoutingModule } from './PasswordReset-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    PasswordResetRoutingModule
  ],
  declarations: [
    PasswordResetComponent
  ]
})
export class PasswordResetModule { }
