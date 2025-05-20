import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { BiometricDevicedataComponent } from './BiometricDevicedata.component';
import { AuthGuard } from '../../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: BiometricDevicedataComponent, canActivate: [AuthGuard] },
    // { path: '', component: AttendanceReportsComponent},
    { path: 'AttendanceReports/:id' , component:BiometricDevicedataComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class BiometricDevicedataRoutingModule { }
