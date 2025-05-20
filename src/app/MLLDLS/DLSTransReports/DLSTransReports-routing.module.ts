import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { DLSTransReportsComponent } from './DLSTransReports.component';
const routes: Routes = [
  { path: '', component: DLSTransReportsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DLSTransReportsRoutingModule { }
