import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialComponent } from './material.component';
import { FormsModule } from '@angular/forms';
import { MaterialRoutingModule } from './material-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MaterialRoutingModule,
        SharedmoduleModule
    ],
    declarations: [
        MaterialComponent
    ]
})
export class MaterialModule { }
