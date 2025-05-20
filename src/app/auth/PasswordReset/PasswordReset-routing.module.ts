import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { PasswordResetComponent } from './PasswordReset.component';

const appRoute: Routes = [
  { path: '', component: PasswordResetComponent },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class PasswordResetRoutingModule { }
 