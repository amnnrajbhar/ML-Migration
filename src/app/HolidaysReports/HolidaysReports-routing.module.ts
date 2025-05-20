import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { HolidaysReportsComponent } from './HolidaysReports.component';
const routes: Routes = [
  { path: '', component: HolidaysReportsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HolidaysReportsRoutingModule { }
