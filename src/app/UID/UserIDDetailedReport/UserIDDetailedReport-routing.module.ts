import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { UserIDDetailedReportComponent } from './UserIDDetailedReport.component';

const appRoute: Routes = [
  { path: '', component: UserIDDetailedReportComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class UserIDDetailedReportRoutingModule { }
 