import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EsicSickLeaveComponent } from './EsicSickLeave.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoute: Routes = [
    { path: '', component: EsicSickLeaveComponent, canActivate: [AuthGuard] },
  ];
  @NgModule({
    imports: [
      RouterModule.forChild(appRoute)
    ],
    exports: [RouterModule]
  })
export class EsicSickLeaveRoutingModule { }
