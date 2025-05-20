import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompetencyComponent } from './competency.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: CompetencyComponent,  canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class CompetencyRoutingModule { }
