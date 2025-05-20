import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { ValuationClassRoutingModule } from './valuationclass-routing.module';
import { ValuationClassComponent } from './valuationclass.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ValuationClassRoutingModule
    ],
    declarations: [
        ValuationClassComponent
    ]
})
export class ValuationClassModule { }
