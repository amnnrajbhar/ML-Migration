import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MailComponent } from './mail.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoute: Routes = [
  { path: '', component: MailComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class MailRoutingModule { }
 