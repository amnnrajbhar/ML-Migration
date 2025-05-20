import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { GeOutSubContractSecurityComponent } from './geoutsubcontractsecurity.component';
const appRoute: Routes = [
  { path: '', component: GeOutSubContractSecurityComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(appRoute)],
  exports: [RouterModule]
})
export class GeoutsubcontractsecurityRoutingModule { }
