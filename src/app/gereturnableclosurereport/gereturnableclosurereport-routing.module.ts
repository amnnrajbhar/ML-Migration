import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { GereturnableclosurereportComponent } from './gereturnableclosurereport.component';
const appRoute: Routes = [
  { path: '', component: GereturnableclosurereportComponent, canActivate: [AuthGuard] },
];


@NgModule({
  imports: [RouterModule.forChild(appRoute)],
  exports: [RouterModule]
})
export class GereturnableclosurereportRoutingModule { }
