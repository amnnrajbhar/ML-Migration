import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { GEInReturnableMatComponent } from './geinreturnablemat.component';
import { GeinreturnablematdeptComponent } from './geinreturnablematdept/geinreturnablematdept.component';
const appRoute: Routes = [
  { path: '', component: GEInReturnableMatComponent, canActivate: [AuthGuard] },
  { path: 'geinreturnablematdept', component: GeinreturnablematdeptComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class GEInReturnableMatRoutingModule { }
 