import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { LOPReimbursementComponent } from './LOPReimbursement.component';

const appRoute: Routes = [
  { path: '', component: LOPReimbursementComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class LOPReimbursementRoutingModule { }
 