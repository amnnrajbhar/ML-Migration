import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MyApprovalsComponent } from './MyApprovals.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: MyApprovalsComponent, canActivate: [AuthGuard] },
    // { path: '', component: MyApprovalsComponent},
    { path: 'MyApprovals/:id' , component:MyApprovalsComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class MyApprovalsRoutingModule { }
