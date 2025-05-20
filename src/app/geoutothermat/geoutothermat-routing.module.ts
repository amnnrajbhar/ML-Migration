import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { GEOutOtherMaterialComponent } from './geoutothermat.component';

const appRoute: Routes = [
  { path: '', component: GEOutOtherMaterialComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class GEOutOtherMaterialRoutingModule { }
 