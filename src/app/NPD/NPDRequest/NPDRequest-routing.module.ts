import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { NPDRequestComponent } from './NPDRequest.component';
const routes: Routes = [
  { path: '', component: NPDRequestComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NPDRequestRoutingModule { }
