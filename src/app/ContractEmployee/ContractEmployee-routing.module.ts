import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ContractEmployeeComponent } from './ContractEmployee.component';
import { AuthGuard } from '../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: ContractEmployeeComponent, canActivate: [AuthGuard] },
    // { path: '', component: ContractEmployeeComponent},
    { path: 'ContractEmployee/:id' , component:ContractEmployeeComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class ContractEmployeeRoutingModule { }
