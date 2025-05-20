import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { MailconfigurationComponent } from './mailconfiguration.component';

const appRoute: Routes = [
  { path: '', component: MailconfigurationComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(appRoute)],
  exports: [RouterModule]
})
export class MailconfigurationRoutingModule { }
