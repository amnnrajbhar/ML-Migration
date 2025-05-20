import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LOPMonthlyReportComponent } from './LOPMonthlyReport.component';
import { AuthGuard } from '../../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: LOPMonthlyReportComponent, canActivate: [AuthGuard] },
    // { path: '', component: AttendanceReportsComponent},
    { path: 'AttendanceReports/:id' , component:LOPMonthlyReportComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class LOPMonthlyReportRoutingModule { }
