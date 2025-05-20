import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { ForgotpasswordComponent } from './forgotpassword.component';

const appRoute: Routes = [
  { path: '', component: ForgotpasswordComponent },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class ForgotpasswordRoutingModule { }
 