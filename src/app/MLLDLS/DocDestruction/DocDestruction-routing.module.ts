import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { DocDestructionComponent } from './DocDestruction.component';
const routes: Routes = [
  { path: '', component: DocDestructionComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocDestructionRoutingModule { }
