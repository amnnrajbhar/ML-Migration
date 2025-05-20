import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ShiftAllowanceComponent } from './ShiftAllowance.component';
import { AuthGuard } from '../../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: ShiftAllowanceComponent, canActivate: [AuthGuard] },
    // { path: '', component: AttendanceReportsComponent},
    { path: 'AttendanceReports/:id' , component:ShiftAllowanceComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class ShiftAllowanceRoutingModule { }
