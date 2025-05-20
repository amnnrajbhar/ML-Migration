import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AddProfileComponent } from './add-profile.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoute: Routes = [
  { path: '', component: AddProfileComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class AddProfileRoutingModule { }
