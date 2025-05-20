import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AttendanceMusterorSummaryComponent } from './AttendanceMusterorSummary.component';
import { AuthGuard } from '../../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: AttendanceMusterorSummaryComponent, canActivate: [AuthGuard] },
    // { path: '', component: AttendanceReportsComponent},
    { path: 'AttendanceReports/:id' , component:AttendanceMusterorSummaryComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class AttendanceMusterorSummaryRoutingModule { }
