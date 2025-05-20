import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { GesubcontractreportComponent } from './gesubcontractreport.component';
const routes: Routes = [
  { path: '', component: GesubcontractreportComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GesubcontractreportRoutingModule { }
