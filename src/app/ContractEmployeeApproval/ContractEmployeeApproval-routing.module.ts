import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ContractEmployeeApprovalComponent } from './ContractEmployeeApproval.component';
import { AuthGuard } from '../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: ContractEmployeeApprovalComponent, canActivate: [AuthGuard] },
    // { path: '', component: ContractEmployeeComponent},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class ContractEmployeeApprovalRoutingModule { }
