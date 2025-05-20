import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GEOutRegRoutingModule } from './geoutregreport-routing.module';
import { GEOutRegComponent } from './geoutregreport.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        GEOutRegRoutingModule
    ],
    declarations: [
        GEOutRegComponent
    ]
})
export class GEOutRegModule { }
