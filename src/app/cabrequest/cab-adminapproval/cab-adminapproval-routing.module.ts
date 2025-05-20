import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { CabAdminapprovalComponent } from './cab-adminapproval.component';

const appRoute: Routes = [
  { path: '', component: CabAdminapprovalComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class CabAdminApprovalRoutingModule { }
 