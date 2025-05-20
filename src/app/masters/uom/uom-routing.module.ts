import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './../../auth/auth-guard.service';
import {UomComponent} from './uom.component'

const appRoutes: Routes = [
  { path: '', component: UomComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class UomRoutingModule { }
