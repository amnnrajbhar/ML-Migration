import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { DLSReportsComponent } from './DLSReports.component';
const routes: Routes = [
  { path: '', component: DLSReportsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DLSReportsRoutingModule { }
