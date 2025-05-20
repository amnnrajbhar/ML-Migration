import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { DLSSubstituteComponent } from './DLSSubstitute.component';
const routes: Routes = [
  { path: '', component: DLSSubstituteComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DLSSubstituteRoutingModule { }
