import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { MediServiceRequestHistoryComponent } from './MediServiceRequestHistory.component';
const routes: Routes = [
  { path: '', component: MediServiceRequestHistoryComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MediServiceRequestHistoryRoutingModule { }
