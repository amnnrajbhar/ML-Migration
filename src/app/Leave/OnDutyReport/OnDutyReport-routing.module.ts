import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { OnDutyReportComponent } from './OnDutyReport.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: OnDutyReportComponent, canActivate: [AuthGuard] },
    // { path: '', component: OnDutyReportComponent},
    { path: 'OnDutyReport/:id' , component:OnDutyReportComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class OnDutyReportRoutingModule { }
