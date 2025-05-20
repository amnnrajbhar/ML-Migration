import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { GeOutOtherMaterialSecurityComponent } from './geoutothermatsecurity.component';
const appRoute: Routes = [
  { path: '', component: GeOutOtherMaterialSecurityComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(appRoute)],
  exports: [RouterModule]
})
export class GeoutothermatsecurityRoutingModule { }
