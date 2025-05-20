import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnauthorizedComponent } from './unauthorized.component';
import { AuthGuard } from '../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: UnauthorizedComponent, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class UnauthorizedRoutingModule { }
