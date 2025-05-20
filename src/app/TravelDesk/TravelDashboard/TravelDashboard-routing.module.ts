import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TravelDashboardComponent } from './TravelDashboard.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoute: Routes = [
  { path: '', component: TravelDashboardComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class TravelDashboardRoutingModule { }