import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { DashboardRoutingModule } from './Dashboard-Routing.module';
import { DashboardComponent } from './Dashboard.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        DashboardRoutingModule,
        
    ],
    declarations: [
        DashboardComponent
    ]
})
export class DashboardModule { }
