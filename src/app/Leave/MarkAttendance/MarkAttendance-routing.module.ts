import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { MarkAttendancecomponent } from './MarkAttendance.component';

const appRoutes: Routes = [
    { path: '', component: MarkAttendancecomponent, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),  
    ],
    exports: [RouterModule]
})
export class MarkAttendanceRoutingModule { }