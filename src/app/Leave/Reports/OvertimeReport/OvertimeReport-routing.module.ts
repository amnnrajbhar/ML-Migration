import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { OvertimeReportComponent } from './OvertimeReport.component';
import { AuthGuard } from '../../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: OvertimeReportComponent, canActivate: [AuthGuard] },
    // { path: '', component: AttendanceReportsComponent},
    { path: 'AttendanceReports/:id' , component:OvertimeReportComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class OvertimeReportRoutingModule { }
