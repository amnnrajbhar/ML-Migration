import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ApplyLeaveComponent } from './ApplyLeave.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: ApplyLeaveComponent, canActivate: [AuthGuard] },
    // { path: '', component: ApplyLeaveComponent},
    { path: 'ApplyLeave/:id' , component:ApplyLeaveComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class ApplyLeaveRoutingModule { }
