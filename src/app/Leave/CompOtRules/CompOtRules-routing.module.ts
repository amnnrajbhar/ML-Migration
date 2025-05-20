import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { CompOtRulescomponent } from './CompOtRules.component';

const appRoutes: Routes = [
    { path: '', component: CompOtRulescomponent, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),  
    ],
    exports: [RouterModule]
})
export class CompOtRulesRoutingModule { }