import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { AssessmentmasterreportComponent } from './assessmentmasterreport.component';

const appRoute: Routes = [
  { path: '', component: AssessmentmasterreportComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class AssessmentmasterreportRoutingModule { }
 