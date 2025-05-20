import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ApprovalEmployeeComponent } from './employee.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    // { path: '', component: EmployeeComponent, canActivate: [AuthGuard] },
    { path: '', component: ApprovalEmployeeComponent},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class EmployeeRoutingModule { }
