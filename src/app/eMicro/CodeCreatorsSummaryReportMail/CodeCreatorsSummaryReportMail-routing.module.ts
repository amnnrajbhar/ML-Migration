import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { CodeCreatorsSummaryReportMailComponent } from './CodeCreatorsSummaryReportMail.component';

const appRoutes: Routes = [
    { path: '', component: CodeCreatorsSummaryReportMailComponent },
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class CodeCreatorsSummaryReportMailRoutingModule { }
