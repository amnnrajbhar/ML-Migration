import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { OverallRatingComponent } from './overallrating.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoute: Routes = [
  { path: '', component: OverallRatingComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class OverallratingRoutingModule { }
 