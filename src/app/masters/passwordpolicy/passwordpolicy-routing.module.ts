import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { PasswordpolicyComponent } from './passwordpolicy.component';

const appRoute: Routes = [
  { path: '', component: PasswordpolicyComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(appRoute)],
  exports: [RouterModule]
})
export class PasswordpolicyRoutingModule { }
