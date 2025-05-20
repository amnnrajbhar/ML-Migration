import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CompOffReportComponent } from './CompOffReport.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: CompOffReportComponent, canActivate: [AuthGuard] },
    // { path: '', component: CompOffReportComponent},
    { path: 'CompOffReport/:id' , component:CompOffReportComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class CompOffReportRoutingModule { }
