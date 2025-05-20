import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { ProcessMasterRoutingModule } from './ProcessMaster-routing.module';
import { ProcessMasterComponent } from './ProcessMaster.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ProcessMasterRoutingModule
    ],
    declarations: [
        ProcessMasterComponent
    ]
})
export class ProcessMasterModule { }
