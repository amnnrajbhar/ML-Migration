﻿import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './../auth/auth-guard.service';
import { GEInwardRegReportComponent } from './geinregreport.component';

const appRoutes: Routes = [
    { path: '', component: GEInwardRegReportComponent, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class GEInwardRegReportRoutingModule { }
