import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './Assetdashboard.component';
import { DashboardRoutingModule } from './Assetdashboard-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DashboardRoutingModule
    ],
    declarations: [
        DashboardComponent
    ]
})
export class DashboardModule { }
