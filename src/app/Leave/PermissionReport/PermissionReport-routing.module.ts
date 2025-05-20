import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PermissionReportComponent } from './PermissionReport.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: PermissionReportComponent, canActivate: [AuthGuard] },
    // { path: '', component: PermissionReportComponent},
    { path: 'PermissionReport/:id' , component:PermissionReportComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class PermissionReportRoutingModule { }
