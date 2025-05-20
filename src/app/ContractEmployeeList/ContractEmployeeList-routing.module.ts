import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ContractEmployeeListComponent } from './ContractEmployeeList.component';
import { AuthGuard } from '../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: ContractEmployeeListComponent, canActivate: [AuthGuard] },
    // { path: '', component: ContractEmployeeComponent},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class ContractEmployeeListRoutingModule { }
