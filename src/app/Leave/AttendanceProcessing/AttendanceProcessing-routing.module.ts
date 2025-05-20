import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AttendanceProcessingComponent } from './AttendanceProcessing.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: AttendanceProcessingComponent, canActivate: [AuthGuard] },
    // { path: '', component: AttendanceProcessingComponent},
    { path: 'AttendanceProcessing/:id' , component:AttendanceProcessingComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class AttendanceProcessingRoutingModule { }
