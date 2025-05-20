import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { AllowanceMappingComponent } from './AllowanceMapping.component';

const appRoute: Routes = [
  { path: '', component: AllowanceMappingComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class AllowanceMappingRoutingModule { }