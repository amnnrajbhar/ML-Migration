import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
 import { UpdateAMCDetailsComponent } from './UpdateAMCDetails.component';

const appRoute: Routes = [
  { path: '', component: UpdateAMCDetailsComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class UpdateAMCDetailsRoutingModule { }
 