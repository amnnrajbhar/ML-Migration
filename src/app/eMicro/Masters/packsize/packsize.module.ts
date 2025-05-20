import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { PackSizeRoutingModule } from './packsize-routing.module';
import { PackSizeComponent } from './packsize.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        PackSizeRoutingModule
    ],
    declarations: [
        PackSizeComponent
    ]
})
export class PackSizeModule { }
