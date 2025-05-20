import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { PackTypeRoutingModule } from './packtype-routing.module';
import { PackTypeComponent } from './packtype.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        PackTypeRoutingModule
    ],
    declarations: [
        PackTypeComponent
    ]
})
export class PackTypeModule { }
