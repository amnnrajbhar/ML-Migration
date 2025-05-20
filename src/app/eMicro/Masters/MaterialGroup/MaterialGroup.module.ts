import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { MaterialGroupRoutingModule } from './MaterialGroup-routing.module';
import { MaterialGroupComponent } from './MaterialGroup.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        MaterialGroupRoutingModule
    ],
    declarations: [
        MaterialGroupComponent
    ]
})
export class MaterialGroupModule { }
