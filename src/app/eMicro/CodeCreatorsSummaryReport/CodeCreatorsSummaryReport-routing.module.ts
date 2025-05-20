import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { CodeCreatorsSummaryReportComponent } from './CodeCreatorsSummaryReport.component';

const appRoutes: Routes = [
    { path: '', component: CodeCreatorsSummaryReportComponent, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class CodeCreatorsSummaryReportRoutingModule { }
