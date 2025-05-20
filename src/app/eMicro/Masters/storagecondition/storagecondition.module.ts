import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { StorageConditionRoutingModule } from './storagecondition-routing.module';
import { StorageConditionComponent } from './storagecondition.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        StorageConditionRoutingModule
    ],
    declarations: [
        StorageConditionComponent
    ]
})
export class StorageConditionModule { }
