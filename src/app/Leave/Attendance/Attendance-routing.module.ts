import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AttendanceComponent } from './Attendance.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: AttendanceComponent, canActivate: [AuthGuard] },
    // { path: '', component: AttendanceComponent},
    { path: 'Attendance/:id' , component:AttendanceComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class AttendanceRoutingModule { }
