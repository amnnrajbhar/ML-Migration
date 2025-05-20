import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LeaveReportComponent } from './LeaveReport.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: LeaveReportComponent, canActivate: [AuthGuard] },
    // { path: '', component: LeaveReportComponent},
    { path: 'LeaveReport/:id' , component:LeaveReportComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class LeaveReportRoutingModule { }
