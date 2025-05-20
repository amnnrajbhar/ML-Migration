import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MaterialComponent } from './material.component';
import { AuthGuard } from './../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: MaterialComponent, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class MaterialRoutingModule { }
