import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { TempConditionRoutingModule } from './tempcondition-routing.module';
import { TempConditionComponent } from './tempcondition.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        TempConditionRoutingModule
    ],
    declarations: [
        TempConditionComponent
    ]
})
export class TempConditionModule { }
