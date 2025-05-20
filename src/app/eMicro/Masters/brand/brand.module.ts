import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { BrandComponent } from './brand.component';
import { BrandRoutingModule } from './brand-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        BrandRoutingModule
    ],
    declarations: [
        BrandComponent
    ]
})
export class BrandModule { }
