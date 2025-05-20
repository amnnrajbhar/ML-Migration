import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../../auth/auth-guard.service';
import { DivisionComponent } from './division.component';

const appRoutes: Routes = [
    { path: '', component: DivisionComponent, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class DivisionRoutingModule { }
