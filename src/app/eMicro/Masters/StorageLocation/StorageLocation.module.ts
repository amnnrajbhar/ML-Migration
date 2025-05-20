import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { StorageLocationRoutingModule } from './StorageLocation-routing.module';
import { StorageLocationComponent } from './StorageLocation.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        StorageLocationRoutingModule
    ],
    declarations: [
        StorageLocationComponent
    ]
})
export class StorageLocationModule { }
