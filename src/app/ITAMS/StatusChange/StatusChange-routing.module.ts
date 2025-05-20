import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { StatusChangeComponent } from './StatusChange.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: StatusChangeComponent, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class StatusChangeRoutingModule { }
