import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaterialmasterComponent } from './materialmaster.component';
import { AuthGuard } from './../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: MaterialmasterComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class MaterialmasterRoutingModule { }
