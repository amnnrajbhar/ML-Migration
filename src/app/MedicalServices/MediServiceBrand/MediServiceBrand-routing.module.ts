import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { MediServiceBrandComponent } from './MediServiceBrand.component';
const routes: Routes = [
  { path: '', component: MediServiceBrandComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MediServiceBrandRoutingModule { }
