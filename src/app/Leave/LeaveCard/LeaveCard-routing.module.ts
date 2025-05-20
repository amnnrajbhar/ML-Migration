import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LeaveCardComponent } from './LeaveCard.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: LeaveCardComponent, canActivate: [AuthGuard] },
    // { path: '', component: LeaveCardComponent},
    { path: 'LeaveCard/:id' , component:LeaveCardComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class LeaveCardRoutingModule { }
