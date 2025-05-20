import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './../../auth/auth-guard.service';
import { SpocDetailsComponent } from './SpocDetails.component';

const appRoutes: Routes = [
    { path: '', component: SpocDetailsComponent, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
    ],
    exports: [RouterModule]
})
export class SpocDetailsRoutingModule { }