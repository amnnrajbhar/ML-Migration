import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { WorkFlowApproversRoutingModule } from './WorkFlowApprovers-routing.module';
import { WorkFlowApproversComponent } from './WorkFlowApprovers.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        WorkFlowApproversRoutingModule
    ],
    declarations: [
        WorkFlowApproversComponent
    ]
})
export class WorkFlowApproversModule { }
